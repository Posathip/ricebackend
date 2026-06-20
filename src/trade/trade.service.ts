import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { FastifyReply } from 'fastify';
import * as https from 'https';
import { parseStringPromise } from 'xml2js';
import { CreateSurveyDto } from 'src/dto/user.dto';
import { CreateOrderDto } from 'src/dto/request.dto';

@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Private helpers ────────────────────────────────────────────────────────

  private buildSoapXml(startDate: string, endDate: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetPaperlessData xmlns="http://tempuri.org/">
          <DataRequest>
            <OrganizeCode>${this.configService.get<string>('SOAP_ORGAN_CODE')}</OrganizeCode>
            <StartDate>${startDate}</StartDate>
            <EndDate>${endDate}</EndDate>
          </DataRequest>
        </GetPaperlessData>
      </soap:Body>
    </soap:Envelope>`;
  }

  private makeSoapRequest(xml: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.configService.get<string>('SOAP_HOSTNAME'),
        path: this.configService.get<string>('SOAP_PATH'),
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(xml),
          SOAPAction: this.configService.get<string>('SOAP_ACTION'),
        },
      };

      const req = https.request(options, (soapRes) => {
        let data = '';
        soapRes.on('data', (chunk) => (data += chunk));
        soapRes.on('end', () => resolve(data));
      });

      req.on('error', (err) => reject(err));
      req.write(xml);
      req.end();
    });
  }

  private buildTodayDateRange(): { STARTDATE: string; ENDDATE: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;
    return {
      STARTDATE: `${today}T00:00:00`,
      ENDDATE: `${today}T23:59:59`,
    };
  }

  // ─── Public methods ──────────────────────────────────────────────────────────

  async getData(request: any, response: FastifyReply): Promise<void> {
    // console.log('[TradeService.getData]');
    const { STARTDATE, ENDDATE } = this.buildTodayDateRange();
    // console.log('[TradeService.getData] range:', STARTDATE, '→', ENDDATE);

    const xml = this.buildSoapXml(STARTDATE, ENDDATE);

    try {
      const rawXML = await this.makeSoapRequest(xml);
      const result = await parseStringPromise(rawXML, { explicitArray: false });

      const parsedList =
        result['soap:Envelope']['soap:Body']['GetPaperlessDataResponse'][
          'GetPaperlessDataResult'
        ]['LicenseHeader'];

      const dataGovList: any[] = [];
      const licenseDetailList: any[] = [];

      for (const item of parsedList) {
        const exists = await this.prisma.dataFromGoverment.findUnique({
          where: { fullLicenseNumber: item.LicenseNumber },
        });

        if (exists) {
          // console.log('[TradeService.getData] skip existing:', item.LicenseNumber);
          continue;
        }

        const dataID = crypto.randomUUID();

        dataGovList.push({
          dataID,
          fullLicenseNumber: item.LicenseNumber,
          licenseNumber: item.LicenseNumber.replace(/\D/g, ''),
          exporter: cleanCompanyName(item.Exporter),
          exporterNoCut: item.Exporter || null,
          recipient: item.Recipient,
          telephone: extractTelephone(item.Exporter),
          buyer: item.Buyer || null,
          exportAgent: extractFirstName(item.Export_Agent),
          exportAgentNoCut: item.Export_Agent || null,
          companyTax: item.CompanyTax,
          product: item.Product,
          issueDate: convertToAD(item.IssueDate),
          expiredDate: convertToAD(item.ExpiredDate),
          exportDate: item.ExportDate ? convertToAD(item.ExportDate) : null,
          buyerCountry: item.BuyerCountry,
          destinationCountry: item.DestinationCountry,
          exportBy: item.ExportBy || null,
          vehicle: item.Vehicle,
          portName: item.PortName,
          currency: item.Currency,
          exchangeRate: parseFloat(item.ExchangeRate),
          permitConditions: item.PermitConditions,
        });

        const details = item.PaperlessDetail?.LicenseDetail;
        if (details) {
          const detailsArray = Array.isArray(details) ? details : [details];
          for (const detail of detailsArray) {
            const existsDetail = await this.prisma.licenseDetail.findFirst({
              where: {
                productDescription: detail.ProductDescription,
                price: parseFloat(detail.Price),
                netWeightTON: parseFloat(detail.NetWeightTON),
              },
            });
            if (!existsDetail) {
              const netWeightW =
                parseFloat(detail.NetWeightKGM) / parseFloat(detail.Quantity);
              licenseDetailList.push({
                permitId: dataID,
                licenseNumber: item.LicenseNumber.replace(/\D/g, ''),
                tariffType: detail.TariffType,
                netWeightTON: parseFloat(detail.NetWeightTON),
                netWeightUnit: detail.NetWeightUnit,
                netWeightKGM: parseFloat(detail.NetWeightKGM),
                netWeightUnitKGM: detail.NetWeightUnitKGM,
                quantity: parseInt(detail.Quantity),
                quantityUnit: detail.QuantityUnit,
                pricePerUnit: parseFloat(detail.PricePerUnit),
                currencyPerTON: detail.CurrencyPerTON,
                fob: parseFloat(detail.FOB),
                price: parseFloat(detail.Price),
                incoterms: detail.Incoterms,
                productDescription: cleanRiceType(detail.ProductDescription),
                productDescriptionNotCut: detail.ProductDescription,
                netWeightW,
              });
            }
          }
        }
      }

      await this.prisma.dataFromGoverment.createMany({
        data: dataGovList,
        skipDuplicates: true,
      });
      await this.prisma.licenseDetail.createMany({ data: licenseDetailList });

      // console.log('[TradeService.getData] inserted dataGov:', dataGovList.length, 'details:', licenseDetailList.length);
      return response.status(200).send({
        message: '✅ Data fetched and saved from SOAP service',
        inserted: dataGovList.length,
        skipped: parsedList.length - dataGovList.length,
      });
    } catch (err: any) {
      console.error('[TradeService.getData] SOAP Error:', err);
      return response.status(500).send({
        message: '❌ Failed to fetch SOAP data',
        error: err.message || err,
      });
    }
  }

  async licensequery(
    licenseNo: string,
    request: any,
    response: FastifyReply,
  ): Promise<object> {
    // console.log('[TradeService.licensequery] licenseNo:', licenseNo);
    try {
      const querydata = await this.prisma.dataFromGoverment.findFirst({
        where: { licenseNumber: licenseNo },
        include: { licenseDetails: true },
      });

      if (!querydata) {
        throw new NotFoundException('No License Data');
      }

      // console.log('[TradeService.licensequery] found:', querydata.dataID);
      return { message: 'Get data  sucessfully', querydata };
    } catch (error) {
      console.error('[TradeService.licensequery]', error);
      return { error };
    }
  }

  async createOrder(
    dto: CreateOrderDto,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.createOrder] licenseNumber:', dto.licenseNumber);
    try {
      const getdata = await this.prisma.dataFromGoverment.findUnique({
        where: { licenseNumber: dto.licenseNumber },
        include: { licenseDetails: true },
      });

      await this.prisma.request.create({
        data: {
          companyName: cleanCompanyName(dto.companyName),
          requestBy: dto.requestBy,
          requestDate: new Date(dto.requestDate),
          shippingDateTime: new Date(dto.shippingDateTime),
          surveyLocateNameThai: dto.surveyLocateNameThai,
          surveyLocateNameEng: dto.surveyLocateNameEng,
          surveyPaidBy: dto.surveyPaidBy,
          surveyProvince: dto.surveyProvince,
          surveySubDistrict: dto.surveySubDistrict,
          telInspector: dto.telInspector,
          telDebtor: dto.telDebtor,
          licenseNumber: dto.licenseNumber,
          status: this.configService.get<string>('ORDER_STATUS_INCOMPLETE', 'incomplete'),
          payer: dto.payer,
          portName: getdata?.portName,
          descriptions: {
            create: dto.description.map((desc) => ({
              descriptionID: desc.descriptionID,
              destination: desc.destination,
              riceType: cleanRiceType(desc.riceType),
              vehicleName: desc.vehicleName,
              marker: desc.marker,
              licenseNumber: desc.licenseNumber,
              licenseDetailID: desc.licenseDetailID,
              quantity: desc.quantity,
              quantityUnit: desc.quantityUnit,
              grossWeight: desc.grossWeight,
              netWeightW: desc.netWeightW,
              netWeightKGM: desc.netWeightKGM,
              netWeightTON: desc.netWeightTON,
              portName: desc.portName,
              index: desc.index,
            })),
          },
        },
      });

      const bufferRemainList = dto.description
        .filter((desc) => desc.licenseDetailID)
        .map((desc) => ({
          licenseDetailID: desc.licenseDetailID!,
          remainNetWeightKGM: desc.netWeightKGM,
          MaximumWeight: desc.netWeightKGM,
        }));

      if (bufferRemainList.length > 0) {
        await this.prisma.bufferRemain.createMany({
          data: bufferRemainList,
          skipDuplicates: true,
        });
      }

      // console.log('[TradeService.createOrder] order created for license:', dto.licenseNumber);
      return response.status(200).send({
        success: true,
        message: 'Order created successfully',
      });
    } catch (error) {
      console.error('[TradeService.createOrder]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to create order',
        error: error,
      });
    }
  }

  async getRequestbydate(
    date: string,
    req: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.getRequestbydate] date:', date);
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return response.status(400).send({ success: false, message: 'Invalid date format' });
      }

      const requests = await this.prisma.request.findMany({
        where: {
          requestDate: {
            gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
            lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
          },
        },
        select: {
          requestID: true,
        
          companyName: true,
          status: true,
          surveySubDistrict: true,
          
          descriptions: {
            select: {
              index: true,
              descriptionID: true,
              licenseNumber: true,
              riceType: true,
              quantity: true,
              destination: true,
              vehicleName: true,
              netWeightTON: true,
            },
            
            orderBy: [
              { index: 'asc' },
              { licenseNumber: 'asc' },
              { riceType: 'asc' },
              { quantity: 'asc' },
              { vehicleName: 'asc' },
              { destination: 'asc' },
            ],
          },
          surveyLocateNameEng: true,
          surveyLocateNameThai: true,
          surveyProvince: true,
          shippingDateTime: true,
          validate_Check_Weight: {
            select: {
              checkWeightID: true,
              jobID: true,
              status: true,
              staffName: true,
              staffID: true,
              vehicleName: true,
              riceName: true,
              quantity: true,
              netWeightTon: true,
              totalNetWeight: true,
              grossWeight: true,
              noOfBags: true,
              goDown: true,
              specialJob: true,
              statusContinue: true,
              descriptionID: true,
            },
          },
          notificationReceipts: {
            select: {
              notificationReceiptID: true,
              jobName: true,
              checkWeightID: true,
              descriptionID: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const companyNames = [...new Set(requests.map((r) => r.companyName))].filter(Boolean);
      const companies = await this.prisma.company.findMany({
        where: { companyNameTH: { in: companyNames } },
        select: { companyNameTH: true, companyNameEN: true },
      });

      const surveyNames = [...new Set(requests.map((r) => r.surveyLocateNameThai))].filter(Boolean);
      const surveyNameRecords = await this.prisma.surveyName.findMany({
        where: { surveyNameTH: { in: surveyNames } },
        select: {
          surveyNameTH: true,
          goDownGroupID: true,
          goDownGroup: {
            select: {
              goDownGroupName: true,
              goDownColor: true,
            },
          },
        },
      });

      const result = await Promise.all(
        requests.map(async (r) => {
          const foundCompany = companies.find((c) => c.companyNameTH === r.companyName);
          const latestJob = await this.prisma.validate_Check_Weight.findFirst({
            where: { requestID: r.requestID },
            orderBy: { jobID: 'desc' },
            select: { jobID: true },
          });

          const matchedSurvey = surveyNameRecords.find((s) => s.surveyNameTH === r.surveyLocateNameThai);

          return {
            ...r,
            surveyLocateNameThai: `${r.surveyLocateNameThai ?? ''}-${r.surveyProvince ?? ''}`.trim(),
            companyNameEng: foundCompany?.companyNameEN ?? '',
            jobID: latestJob?.jobID ?? null,
            goDownGroupID: matchedSurvey?.goDownGroupID ?? null,
            goDownGroupName: matchedSurvey?.goDownGroup?.goDownGroupName ?? null,
            goDownColor: matchedSurvey?.goDownGroup?.goDownColor ?? null,
          };
        }),
      );

      const prevRequest = await this.prisma.validate_Check_Weight.findFirst({
        orderBy: { jobID: 'desc' },
        select: { jobID: true },
      });

      if (!requests || requests.length === 0) {
        // console.log('[TradeService.getRequestbydate] no requests found');
        return response.status(404).send({
          success: false,
          message: 'No requests found for the given date',
          finalNo: prevRequest?.jobID || '0000',
        });
      }

      // console.log('[TradeService.getRequestbydate] returned', result.length, 'requests');
      return response.status(200).send({
        success: true,
        data: result,
        finalNo: prevRequest?.jobID || '0000',
      });
    } catch (error) {
      console.error('[TradeService.getRequestbydate]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to fetch request by date',
        error: error,
      });
    }
  }

  async getRequest(
    requestID: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.getRequest] requestID:', requestID);
    try {
      const found = await this.prisma.request.findUnique({
        where: { requestID: requestID },
        include: { descriptions: true },
      });

      if (!found) {
        // console.log('[TradeService.getRequest] not found:', requestID);
        return response.status(404).send({ success: false, message: 'Request not found' });
      }

      // console.log('[TradeService.getRequest] found:', found.requestID);
      return response.status(200).send({ success: true, data: found });
    } catch (error) {
      console.error('[TradeService.getRequest]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to fetch request',
        error: error,
      });
    }
  }

  async deleteOrder(
    orderID: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.deleteOrder] orderID:', orderID);
    try {
      const existingOrder = await this.prisma.request.findUnique({
        where: { requestID: orderID },
      });

      if (!existingOrder) {
        // console.log('[TradeService.deleteOrder] not found:', orderID);
        return response.status(404).send({ success: false, message: 'Order not found' });
      }

      const findOrder = await this.prisma.validate_Check_Weight.findFirst({
        where: { descriptionID: orderID },
      });

      if (findOrder) {
        return response.status(400).send({
          success: false,
          message: 'Order is submitted already cannot delete',
        });
      }

      await this.prisma.description.deleteMany({ where: { requestId: orderID } });
      await this.prisma.request.delete({ where: { requestID: orderID } });

      // console.log('[TradeService.deleteOrder] deleted:', orderID);
      return response.status(200).send({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      console.error('[TradeService.deleteOrder]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to delete order',
        error: error,
      });
    }
  }

  async deleteOrderDetail(
    descriptionID: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.deleteOrderDetail] descriptionID:', descriptionID);
    try {
      const checkWeight = await this.prisma.validate_Check_Weight.findFirst({
        where: { descriptionID: descriptionID },
      });

      if (checkWeight) {
        return response.status(400).send({
          success: false,
          message: 'Cannot delete order detail, it has been submitted for weight check',
        });
      }

      const existingOrder = await this.prisma.description.findUnique({
        where: { descriptionID: descriptionID },
      });

      if (!existingOrder) {
        // console.log('[TradeService.deleteOrderDetail] not found:', descriptionID);
        return response.status(404).send({ success: false, message: 'Order not found' });
      }

      await this.prisma.description.delete({ where: { descriptionID: descriptionID } });

      // console.log('[TradeService.deleteOrderDetail] deleted:', descriptionID);
      return response.status(200).send({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      console.error('[TradeService.deleteOrderDetail]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to delete order',
        error: error,
      });
    }
  }

  async updateOrder(
    id: string,
    body: any,
    request: any,
    response: FastifyReply,
  ): Promise<object> {
    // console.log('[TradeService.updateOrder] id:', id);
    try {
      const updateRequestData = {
        companyName: body.companyName,
        requestBy: body.requestBy,
        requestDate: body.requestDate ? new Date(body.requestDate) : undefined,
        shippingDateTime: body.shippingDateTime ? new Date(body.shippingDateTime) : undefined,
        surveyLocateNameThai: body.surveyLocateNameThai,
        surveyLocateNameEng: body.surveyLocateNameEng,
        surveyPaidBy: body.surveyPaidBy,
        surveyProvince: body.surveyProvince,
        surveySubDistrict: body.surveySubDistrict,
        telInspector: body.telInspector,
        telDebtor: body.telDebtor,
        license: body.license,
        payer: body.payer,
      };

      const hasRequestData = Object.values(updateRequestData).some((val) => val !== undefined);

      if (hasRequestData) {
        await this.prisma.request.update({
          where: { requestID: String(id) },
          data: updateRequestData,
        });
      }

      if (Array.isArray(body.description)) {
        for (const desc of body.description) {
          if (!desc.descriptionID) continue;

          const existing = await this.prisma.description.findUnique({
            where: { descriptionID: desc.descriptionID },
          });

          if (existing) {
            await this.prisma.description.update({
              where: { descriptionID: desc.descriptionID },
              data: { ...desc },
            });
          } else {
            await this.prisma.description.create({
              data: { ...desc, requestID: id },
            });
          }
        }
      }

      // console.log('[TradeService.updateOrder] updated:', id);
      return { success: true, message: 'Order updated successfully' };
    } catch (error) {
      console.error('[TradeService.updateOrder]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to update order',
        error: error,
      });
    }
  }

  async postSurvey(
    dto: CreateSurveyDto[],
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.postSurvey] count:', dto.length);
    try {
      await this.prisma.surveyName.createMany({
        data: dto.map((item) => ({
          amphoes: item.amphoes || '-',
          changwat: item.changwat || '-',
          surveyNameEN: item.surveyNameEN || '-',
          surveyNameTH: item.surveyNameTH || '-',
        })),
      });

      // console.log('[TradeService.postSurvey] created', dto.length, 'survey entries');
      return response.status(200).send({ success: true, message: 'Survey posted successfully' });
    } catch (error) {
      console.error('[TradeService.postSurvey]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to post survey',
        error: error,
      });
    }
  }

  async getInspectPlace(request: any, response: FastifyReply): Promise<void> {
    // console.log('[TradeService.getInspectPlace]');
    try {
      const getInspectPlace = await this.prisma.surveyName.findMany({
        select: {
          surveyNameTH: true,
          surveyNameEN: true,
          changwat: true,
          amphoes: true,
        },
        distinct: ['surveyNameTH', 'surveyNameEN'],
        orderBy: { surveyNameTH: 'asc' },
      });

      // console.log('[TradeService.getInspectPlace] count:', getInspectPlace.length);
      return response.status(200).send({ success: true, data: getInspectPlace });
    } catch (error) {
      console.error('[TradeService.getInspectPlace]', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to fetch inspect places',
        error: error,
      });
    }
  }

  async getlicensebyDate(
    startdate: string,
    enddate: string,
    request: any,
    response: FastifyReply,
  ): Promise<void> {
    // console.log('[TradeService.getlicensebyDate] startdate:', startdate, 'enddate:', enddate);
    const xml = this.buildSoapXml(startdate, enddate);

    try {
      const rawXML = await this.makeSoapRequest(xml);
      const parsed = await parseStringPromise(rawXML, { explicitArray: false });

      const responseData =
        parsed['soap:Envelope']?.['soap:Body']?.['GetPaperlessDataResponse']?.[
          'GetPaperlessDataResult'
        ]?.['LicenseHeader'] ?? null;

      // console.log('[TradeService.getlicensebyDate] data fetched');
      return response.status(200).send({
        message: '✅ Data fetched from SOAP service',
        data: responseData,
      });
    } catch (err: any) {
      console.error('[TradeService.getlicensebyDate] SOAP Error:', err);
      return response.status(500).send({
        message: '❌ Failed to fetch SOAP data',
        error: err.message || err,
      });
    }
  }
}

// ─── Module-level helpers ────────────────────────────────────────────────────

function cleanRiceType(riceType: string): string {
  if (!riceType) return riceType;

  const percentIndex = riceType.indexOf('%');
  if (percentIndex !== -1) {
    return riceType.substring(0, percentIndex + 1).trim();
  }

  const packIndex = riceType.indexOf('บรรจุ');
  if (packIndex !== -1) {
    return riceType.substring(0, packIndex).trim();
  }

  return riceType.trim();
}

function convertToAD(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  const [day, month, buddhistYear] = dateStr.split('/');
  if (!day || !month || !buddhistYear) {
    throw new Error(`Malformed Thai date: ${dateStr}`);
  }

  const year = parseInt(buddhistYear, 10) - 543;
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid converted date: ${isoString}`);
  }

  return date;
}

function cleanCompanyName(companyName: string): string {
  if (!companyName) return companyName;

  companyName = companyName.replace(/^บริษัท\s*/, '');
  const index = companyName.indexOf('จำกัด');

  if (index !== -1) {
    return companyName.substring(0, index + 'จำกัด'.length).trim();
  }

  return companyName.trim();
}

function extractTelephone(text: string): string {
  const match = text.match(/Tel\.?\s*([0-9]+)/);
  return match ? match[1].trim() : '';
}

function extractFirstName(text: string): string {
  const prefixes = ['ว่าที่ร้อยตรี', 'นางสาว', 'นาง', 'นาย'];
  const regex = new RegExp(
    `^(?:${prefixes.join('|')})\\s*([\\u0E00-\\u0E7Fa-zA-Z]+)`,
    'u',
  );
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}
