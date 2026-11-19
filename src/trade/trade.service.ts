import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Description, Prisma } from '@prisma/client';
import * as https from 'https';
import { PrismaService } from 'prisma/prisma.service';
import { rethrowAsHttpException } from 'src/common/service-error';
import { CreateOrderDto, UpdateOrderDescriptionDto, UpdateOrderDto } from 'src/dto/request.dto';
import { CreateSurveyDto } from 'src/dto/user.dto';
import { parseStringPromise } from 'xml2js';
import {
  cleanCompanyName,
  cleanRiceType,
  convertBuddhistDateToAD,
  digitsOnly,
  extractFirstName,
  extractTelephone,
  toArray,
} from './trade.helpers';

const DEFAULT_ORDER_STATUS_INCOMPLETE = 'incomplete';
const DEFAULT_FINAL_JOB_NO = '0000';
const EMPTY_SURVEY_FIELD = '-';
const SOAP_CONTENT_TYPE = 'text/xml; charset=utf-8';

/** Raw license header as parsed from the government SOAP response (all values are strings). */
export interface SoapLicenseHeader {
  LicenseNumber: string;
  Exporter?: string;
  Recipient: string;
  Buyer?: string;
  Export_Agent?: string;
  CompanyTax: string;
  Product: string;
  IssueDate: string;
  ExpiredDate: string;
  ExportDate?: string;
  BuyerCountry: string;
  DestinationCountry: string;
  ExportBy?: string;
  Vehicle: string;
  PortName: string;
  Currency: string;
  ExchangeRate: string;
  PermitConditions: string;
  PaperlessDetail?: { LicenseDetail?: SoapLicenseDetail | SoapLicenseDetail[] };
}

export interface SoapLicenseDetail {
  TariffType: string;
  NetWeightTON: string;
  NetWeightUnit: string;
  NetWeightKGM: string;
  NetWeightUnitKGM: string;
  Quantity: string;
  QuantityUnit: string;
  PricePerUnit: string;
  CurrencyPerTON: string;
  FOB: string;
  Price: string;
  Incoterms: string;
  ProductDescription: string;
}

const REQUEST_BY_DATE_SELECT = {
  requestID: true,
  companyName: true,
  status: true,
  surveySubDistrict: true,
  surveyLocateNameEng: true,
  surveyLocateNameThai: true,
  surveyProvince: true,
  shippingDateTime: true,
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
      staffID: true,
      jobID: true,
      specialJob: true,
    },
  },
} satisfies Prisma.RequestSelect;

type RequestByDate = Prisma.RequestGetPayload<{ select: typeof REQUEST_BY_DATE_SELECT }>;
type RequestWithDescriptions = Prisma.RequestGetPayload<{ include: { descriptions: true } }>;
type GovernmentLicenseWithDetails = Prisma.DataFromGovermentGetPayload<{ include: { licenseDetails: true } }>;

interface GoDownGroupInfo {
  goDownGroupID: string | null;
  goDownGroupName: string | null;
  goDownColor: string | null;
}

interface RequestLookups {
  companyNameEnByTh: Map<string, string>;
  staffNameById: Map<string, string | null>;
  goDownGroupBySurveyNameTh: Map<string, GoDownGroupInfo>;
  latestJobIdByRequestId: Map<string, number | null>;
}

export type RequestByDateResult = Omit<RequestByDate, 'notificationReceipts'> &
  GoDownGroupInfo & {
    companyNameEng: string;
    jobID: number | null;
    notificationReceipts: (RequestByDate['notificationReceipts'][number] & { staffName: string | null })[];
  };

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface SuccessDataResponse<T> {
  success: boolean;
  data: T;
}

export interface RequestsByDateResponse extends SuccessDataResponse<RequestByDateResult[]> {
  finalNo: number | string;
}

export interface FetchGovernmentDataResult {
  message: string;
  inserted: number;
  skipped: number;
}

export interface InspectPlace {
  surveyNameTH: string;
  surveyNameEN: string;
  changwat: string;
  amphoes: string;
}

@Injectable()
export class TradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Government SOAP data ───────────────────────────────────────────────────

  /** Fetches today's licenses from the government SOAP service and stores the new ones. */
  async fetchTodayGovernmentData(): Promise<FetchGovernmentDataResult> {
    const { startDate, endDate } = this.buildTodayDateRange();
    console.log('[TradeService.fetchTodayGovernmentData] range:', startDate, '→', endDate);
    try {
      const licenseHeaders = await this.fetchLicenseHeaders(startDate, endDate);
      const newHeaders = await this.filterNewLicenses(licenseHeaders);

      const governmentRows: Prisma.DataFromGovermentCreateManyInput[] = [];
      const detailRows: Prisma.LicenseDetailCreateManyInput[] = [];
      for (const header of newHeaders) {
        const dataID = crypto.randomUUID();
        governmentRows.push(this.toGovernmentRow(header, dataID));
        detailRows.push(
          ...toArray(header.PaperlessDetail?.LicenseDetail).map((detail) =>
            this.toLicenseDetailRow(detail, header.LicenseNumber, dataID),
          ),
        );
      }

      await this.prisma.$transaction([
        this.prisma.dataFromGoverment.createMany({ data: governmentRows, skipDuplicates: true }),
        this.prisma.licenseDetail.createMany({ data: detailRows }),
      ]);

      const result = {
        message: '✅ Data fetched and saved from SOAP service',
        inserted: governmentRows.length,
        skipped: licenseHeaders.length - governmentRows.length,
      };
      console.log('[TradeService.fetchTodayGovernmentData] result:', result.inserted, 'inserted,', result.skipped, 'skipped');
      return result;
    } catch (error) {
      rethrowAsHttpException('TradeService.fetchTodayGovernmentData', error);
    }
  }

  /** Returns raw license headers from the government SOAP service (not stored). */
  async getGovernmentLicensesByDate(
    startDate: string,
    endDate: string,
  ): Promise<{ message: string; data: SoapLicenseHeader | SoapLicenseHeader[] | null }> {
    console.log('[TradeService.getGovernmentLicensesByDate] startDate:', startDate, 'endDate:', endDate);
    try {
      const licenseHeaders = await this.fetchRawLicenseHeaders(startDate, endDate);
      console.log('[TradeService.getGovernmentLicensesByDate] result count:', toArray(licenseHeaders).length);
      return { message: '✅ Data fetched from SOAP service', data: licenseHeaders };
    } catch (error) {
      rethrowAsHttpException('TradeService.getGovernmentLicensesByDate', error);
    }
  }

  async getLicenseByNumber(
    licenseNumber: string,
  ): Promise<{ message: string; querydata: GovernmentLicenseWithDetails }> {
    console.log('[TradeService.getLicenseByNumber] licenseNumber:', licenseNumber);
    try {
      const license = await this.prisma.dataFromGoverment.findFirst({
        where: { licenseNumber },
        include: { licenseDetails: true },
      });
      if (!license) throw new NotFoundException('No License Data');

      console.log('[TradeService.getLicenseByNumber] result:', license.dataID);
      return { message: 'Get data  sucessfully', querydata: license };
    } catch (error) {
      rethrowAsHttpException('TradeService.getLicenseByNumber', error);
    }
  }

  // ─── Inspection requests (orders) ───────────────────────────────────────────

  async createRequest(dto: CreateOrderDto): Promise<SuccessResponse> {
    console.log('[TradeService.createRequest] licenseNumber:', dto.licenseNumber, 'descriptions:', dto.description.length);
    try {
      const license = await this.prisma.dataFromGoverment.findUnique({
        where: { licenseNumber: dto.licenseNumber },
        select: { portName: true },
      });

      const bufferRemainRows = dto.description
        .filter((desc) => desc.licenseDetailID)
        .map((desc) => ({
          licenseDetailID: desc.licenseDetailID!,
          remainNetWeightKGM: desc.netWeightKGM,
          MaximumWeight: desc.netWeightKGM,
        }));

      await this.prisma.$transaction([
        this.prisma.request.create({ data: this.buildRequestCreateData(dto, license?.portName) }),
        this.prisma.bufferRemain.createMany({ data: bufferRemainRows, skipDuplicates: true }),
      ]);

      console.log('[TradeService.createRequest] result: created for license', dto.licenseNumber);
      return { success: true, message: 'Order created successfully' };
    } catch (error) {
      rethrowAsHttpException('TradeService.createRequest', error);
    }
  }

  async getRequestsByDate(date: string): Promise<RequestsByDateResponse> {
    console.log('[TradeService.getRequestsByDate] date:', date);
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException({ success: false, message: 'Invalid date format' });
      }

      const [requests, finalNo] = await Promise.all([
        this.prisma.request.findMany({
          where: { requestDate: this.buildDayRange(parsedDate) },
          select: REQUEST_BY_DATE_SELECT,
          orderBy: { createdAt: 'asc' },
        }),
        this.findLatestNotificationJobNo(),
      ]);
      if (requests.length === 0) {
        throw new NotFoundException({ success: false, message: 'No requests found for the given date', finalNo });
      }

      const lookups = await this.buildRequestLookups(requests);
      const result = requests.map((request) => this.toRequestByDateResult(request, lookups));
      console.log('[TradeService.getRequestsByDate] result count:', result.length);
      return { success: true, data: result, finalNo };
    } catch (error) {
      rethrowAsHttpException('TradeService.getRequestsByDate', error);
    }
  }

  async getRequestById(requestID: string): Promise<SuccessDataResponse<RequestWithDescriptions>> {
    console.log('[TradeService.getRequestById] requestID:', requestID);
    try {
      const request = await this.prisma.request.findUnique({
        where: { requestID },
        include: { descriptions: true },
      });
      if (!request) throw new NotFoundException({ success: false, message: 'Request not found' });

      console.log('[TradeService.getRequestById] result:', request.requestID);
      return { success: true, data: request };
    } catch (error) {
      rethrowAsHttpException('TradeService.getRequestById', error);
    }
  }

  async updateRequest(requestID: string, dto: UpdateOrderDto): Promise<SuccessResponse> {
    console.log('[TradeService.updateRequest] requestID:', requestID, 'descriptions:', dto.description?.length ?? 0);
    try {
      const existing = await this.prisma.request.findUnique({ where: { requestID }, select: { requestID: true } });
      if (!existing) throw new NotFoundException({ success: false, message: 'Request not found' });

      const requestData = this.buildRequestUpdateData(dto);
      const hasRequestChanges = Object.values(requestData).some((value) => value !== undefined);
      const descriptionsToUpsert = (dto.description ?? []).filter((desc) => desc.descriptionID);

      await this.prisma.$transaction([
        ...(hasRequestChanges ? [this.prisma.request.update({ where: { requestID }, data: requestData })] : []),
        ...descriptionsToUpsert.map((desc) => this.upsertDescription(requestID, desc)),
      ]);

      console.log('[TradeService.updateRequest] result: updated', requestID);
      return { success: true, message: 'Order updated successfully' };
    } catch (error) {
      rethrowAsHttpException('TradeService.updateRequest', error);
    }
  }

  async deleteRequest(requestID: string): Promise<SuccessResponse> {
    console.log('[TradeService.deleteRequest] requestID:', requestID);
    try {
      const [request, checkWeight] = await Promise.all([
        this.prisma.request.findUnique({ where: { requestID }, select: { requestID: true } }),
        this.prisma.validate_Check_Weight.findFirst({ where: { requestID }, select: { checkWeightID: true } }),
      ]);
      if (!request) throw new NotFoundException({ success: false, message: 'Order not found' });
      if (checkWeight) {
        throw new BadRequestException({ success: false, message: 'Order is submitted already cannot delete' });
      }

      await this.prisma.$transaction([
        this.prisma.notificationReceipt.deleteMany({ where: { requestID } }),
        this.prisma.description.deleteMany({ where: { requestId: requestID } }),
        this.prisma.request.delete({ where: { requestID } }),
      ]);

      console.log('[TradeService.deleteRequest] result deleted:', requestID);
      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('TradeService.deleteRequest', error);
    }
  }

  async deleteDescription(descriptionID: string): Promise<SuccessResponse> {
    console.log('[TradeService.deleteDescription] descriptionID:', descriptionID);
    try {
      const [checkWeight, description] = await Promise.all([
        this.prisma.validate_Check_Weight.findFirst({ where: { descriptionID }, select: { checkWeightID: true } }),
        this.prisma.description.findUnique({ where: { descriptionID }, select: { descriptionID: true } }),
      ]);
      if (checkWeight) {
        throw new BadRequestException({
          success: false,
          message: 'Cannot delete order detail, it has been submitted for weight check',
        });
      }
      if (!description) throw new NotFoundException({ success: false, message: 'Order not found' });

      await this.prisma.description.delete({ where: { descriptionID } });
      console.log('[TradeService.deleteDescription] result deleted:', descriptionID);
      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      rethrowAsHttpException('TradeService.deleteDescription', error);
    }
  }

  // ─── Survey / inspection places ─────────────────────────────────────────────

  async createSurveys(dtoList: CreateSurveyDto[]): Promise<SuccessResponse> {
    console.log('[TradeService.createSurveys] count:', dtoList.length);
    try {
      const { count } = await this.prisma.surveyName.createMany({
        data: dtoList.map((dto) => ({
          amphoes: dto.amphoes || EMPTY_SURVEY_FIELD,
          changwat: dto.changwat || EMPTY_SURVEY_FIELD,
          surveyNameEN: dto.surveyNameEN || EMPTY_SURVEY_FIELD,
          surveyNameTH: dto.surveyNameTH || EMPTY_SURVEY_FIELD,
        })),
      });
      console.log('[TradeService.createSurveys] result created:', count);
      return { success: true, message: 'Survey posted successfully' };
    } catch (error) {
      rethrowAsHttpException('TradeService.createSurveys', error);
    }
  }

  async getInspectPlaces(): Promise<SuccessDataResponse<InspectPlace[]>> {
    console.log('[TradeService.getInspectPlaces]');
    try {
      const inspectPlaces = await this.prisma.surveyName.findMany({
        select: { surveyNameTH: true, surveyNameEN: true, changwat: true, amphoes: true },
        distinct: ['surveyNameTH', 'surveyNameEN'],
        orderBy: { surveyNameTH: 'asc' },
      });
      console.log('[TradeService.getInspectPlaces] result count:', inspectPlaces.length);
      return { success: true, data: inspectPlaces };
    } catch (error) {
      rethrowAsHttpException('TradeService.getInspectPlaces', error);
    }
  }

  // ─── Private helpers: SOAP ──────────────────────────────────────────────────

  private async fetchRawLicenseHeaders(
    startDate: string,
    endDate: string,
  ): Promise<SoapLicenseHeader | SoapLicenseHeader[] | null> {
    const rawXml = await this.postSoapRequest(this.buildSoapXml(startDate, endDate));
    const parsed = await parseStringPromise(rawXml, { explicitArray: false });
    return (
      parsed['soap:Envelope']?.['soap:Body']?.['GetPaperlessDataResponse']?.['GetPaperlessDataResult']?.[
        'LicenseHeader'
      ] ?? null
    );
  }

  private async fetchLicenseHeaders(startDate: string, endDate: string): Promise<SoapLicenseHeader[]> {
    return toArray(await this.fetchRawLicenseHeaders(startDate, endDate));
  }

  /** Drops licenses already stored (by full or digits-only number) and duplicates within the same response. */
  private async filterNewLicenses(headers: SoapLicenseHeader[]): Promise<SoapLicenseHeader[]> {
    const fullNumbers = headers.map((header) => header.LicenseNumber);
    const existing = await this.prisma.dataFromGoverment.findMany({
      where: {
        OR: [
          { fullLicenseNumber: { in: fullNumbers } },
          { licenseNumber: { in: fullNumbers.map(digitsOnly) } },
        ],
      },
      select: { fullLicenseNumber: true, licenseNumber: true },
    });

    const seenNumbers = new Set(existing.flatMap((row) => [row.fullLicenseNumber, row.licenseNumber]));
    return headers.filter((header) => {
      const fullNumber = header.LicenseNumber;
      const shortNumber = digitsOnly(fullNumber);
      if (seenNumbers.has(fullNumber) || seenNumbers.has(shortNumber)) return false;
      seenNumbers.add(fullNumber);
      seenNumbers.add(shortNumber);
      return true;
    });
  }

  private toGovernmentRow(header: SoapLicenseHeader, dataID: string): Prisma.DataFromGovermentCreateManyInput {
    return {
      dataID,
      fullLicenseNumber: header.LicenseNumber,
      licenseNumber: digitsOnly(header.LicenseNumber),
      exporter: cleanCompanyName(header.Exporter ?? ''),
      exporterNoCut: header.Exporter || null,
      recipient: header.Recipient,
      telephone: extractTelephone(header.Exporter),
      buyer: header.Buyer || null,
      exportAgent: extractFirstName(header.Export_Agent),
      exportAgentNoCut: header.Export_Agent || null,
      companyTax: header.CompanyTax,
      product: header.Product,
      issueDate: convertBuddhistDateToAD(header.IssueDate),
      expiredDate: convertBuddhistDateToAD(header.ExpiredDate),
      exportDate: header.ExportDate ? convertBuddhistDateToAD(header.ExportDate) : null,
      buyerCountry: header.BuyerCountry,
      destinationCountry: header.DestinationCountry,
      exportBy: header.ExportBy || null,
      vehicle: header.Vehicle,
      portName: header.PortName,
      currency: header.Currency,
      exchangeRate: parseFloat(header.ExchangeRate),
      permitConditions: header.PermitConditions,
    };
  }

  private toLicenseDetailRow(
    detail: SoapLicenseDetail,
    fullLicenseNumber: string,
    permitId: string,
  ): Prisma.LicenseDetailCreateManyInput {
    const netWeightKGM = parseFloat(detail.NetWeightKGM);
    return {
      permitId,
      licenseNumber: digitsOnly(fullLicenseNumber),
      tariffType: detail.TariffType,
      netWeightTON: parseFloat(detail.NetWeightTON),
      netWeightUnit: detail.NetWeightUnit,
      netWeightKGM,
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
      netWeightW: netWeightKGM / parseFloat(detail.Quantity),
    };
  }

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

  private postSoapRequest(xml: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: this.configService.get<string>('SOAP_HOSTNAME'),
        path: this.configService.get<string>('SOAP_PATH'),
        method: 'POST',
        headers: {
          'Content-Type': SOAP_CONTENT_TYPE,
          'Content-Length': Buffer.byteLength(xml),
          SOAPAction: this.configService.get<string>('SOAP_ACTION'),
        },
      };

      const soapRequest = https.request(options, (soapResponse) => {
        let body = '';
        soapResponse.on('data', (chunk) => (body += chunk));
        soapResponse.on('end', () => resolve(body));
      });
      soapRequest.on('error', reject);
      soapRequest.write(xml);
      soapRequest.end();
    });
  }

  private buildTodayDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return { startDate: `${today}T00:00:00`, endDate: `${today}T23:59:59` };
  }

  // ─── Private helpers: requests ──────────────────────────────────────────────

  private buildRequestCreateData(dto: CreateOrderDto, portName: string | undefined): Prisma.RequestCreateInput {
    return {
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
      status: this.configService.get<string>('ORDER_STATUS_INCOMPLETE', DEFAULT_ORDER_STATUS_INCOMPLETE),
      payer: dto.payer,
      portName,
      descriptions: {
        // `portName` / `netWeight` exist in the DTO but not on the Description model — not stored.
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
          index: desc.index,
        })),
      },
    };
  }

  private buildRequestUpdateData(dto: UpdateOrderDto): Prisma.RequestUpdateInput {
    return {
      companyName: dto.companyName,
      requestBy: dto.requestBy,
      requestDate: dto.requestDate ? new Date(dto.requestDate) : undefined,
      shippingDateTime: dto.shippingDateTime ? new Date(dto.shippingDateTime) : undefined,
      surveyLocateNameThai: dto.surveyLocateNameThai,
      surveyLocateNameEng: dto.surveyLocateNameEng,
      surveyPaidBy: dto.surveyPaidBy,
      surveyProvince: dto.surveyProvince,
      surveySubDistrict: dto.surveySubDistrict,
      telInspector: dto.telInspector,
      telDebtor: dto.telDebtor,
      payer: dto.payer,
    };
  }

  private upsertDescription(requestID: string, desc: UpdateOrderDescriptionDto): Prisma.PrismaPromise<Description> {
    const { descriptionID, ...fields } = desc;
    return this.prisma.description.upsert({
      where: { descriptionID },
      update: fields,
      // Required columns missing from the payload make Prisma reject the create (same as before).
      create: { ...(fields as Prisma.DescriptionUncheckedCreateInput), descriptionID, requestId: requestID },
    });
  }

  private async findLatestNotificationJobNo(): Promise<number | string> {
    const latestReceipt = await this.prisma.notificationReceipt.findFirst({
      where: { jobID: { not: null } },
      orderBy: { jobID: 'desc' },
      select: { jobID: true },
    });
    return latestReceipt?.jobID || DEFAULT_FINAL_JOB_NO;
  }

  private async buildRequestLookups(requests: RequestByDate[]): Promise<RequestLookups> {
    const companyNames = this.uniqueNonEmpty(requests.map((r) => r.companyName));
    const surveyNamesTh = this.uniqueNonEmpty(requests.map((r) => r.surveyLocateNameThai));
    const staffIds = this.uniqueNonEmpty(requests.flatMap((r) => r.notificationReceipts.map((n) => n.staffID)));

    const [companies, staffList, surveyNames, latestJobs] = await Promise.all([
      this.prisma.company.findMany({
        where: { companyNameTH: { in: companyNames } },
        select: { companyNameTH: true, companyNameEN: true },
      }),
      this.prisma.staff.findMany({
        where: { staffID: { in: staffIds } },
        select: { staffID: true, staffName: true },
      }),
      this.prisma.surveyName.findMany({
        where: { surveyNameTH: { in: surveyNamesTh } },
        select: {
          surveyNameTH: true,
          goDownGroupID: true,
          goDownGroup: { select: { goDownGroupName: true, goDownColor: true } },
        },
      }),
      this.prisma.validate_Check_Weight.groupBy({
        by: ['requestID'],
        where: { requestID: { in: requests.map((r) => r.requestID) } },
        _max: { jobID: true },
      }),
    ]);

    return {
      companyNameEnByTh: this.firstMatchMap(companies.map((c) => [c.companyNameTH, c.companyNameEN])),
      staffNameById: new Map(staffList.map((s) => [s.staffID, s.staffName])),
      goDownGroupBySurveyNameTh: this.firstMatchMap(
        surveyNames.map((s) => [
          s.surveyNameTH,
          {
            goDownGroupID: s.goDownGroupID ?? null,
            goDownGroupName: s.goDownGroup?.goDownGroupName ?? null,
            goDownColor: s.goDownGroup?.goDownColor ?? null,
          },
        ]),
      ),
      latestJobIdByRequestId: new Map(latestJobs.map((job) => [job.requestID, job._max.jobID])),
    };
  }

  private toRequestByDateResult(request: RequestByDate, lookups: RequestLookups): RequestByDateResult {
    const goDownGroup = lookups.goDownGroupBySurveyNameTh.get(request.surveyLocateNameThai);
    return {
      ...request,
      surveyLocateNameThai: `${request.surveyLocateNameThai ?? ''}-${request.surveyProvince ?? ''}`.trim(),
      companyNameEng: lookups.companyNameEnByTh.get(request.companyName) ?? '',
      jobID: lookups.latestJobIdByRequestId.get(request.requestID) ?? null,
      goDownGroupID: goDownGroup?.goDownGroupID ?? null,
      goDownGroupName: goDownGroup?.goDownGroupName ?? null,
      goDownColor: goDownGroup?.goDownColor ?? null,
      notificationReceipts: request.notificationReceipts.map((receipt) => ({
        ...receipt,
        staffName: lookups.staffNameById.get(receipt.staffID ?? '') ?? null,
      })),
    };
  }

  // ─── Private helpers: shared ────────────────────────────────────────────────

  private buildDayRange(date: Date): { gte: Date; lt: Date } {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return { gte: new Date(year, month, day), lt: new Date(year, month, day + 1) };
  }

  /** Keeps the first value per key (same result as the previous `Array.find` lookups). */
  private firstMatchMap<V>(entries: [string, V][]): Map<string, V> {
    const map = new Map<string, V>();
    for (const [key, value] of entries) {
      if (!map.has(key)) map.set(key, value);
    }
    return map;
  }

  private uniqueNonEmpty(values: (string | null | undefined)[]): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))];
  }
}
