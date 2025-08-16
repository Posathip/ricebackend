import { Inject, Injectable, NotFoundException, Req, Res } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';

import * as https from 'https'; // สำหรับ HTTPS request
import * as http from 'http'; // สำหรับ fallback HTTP
import { parseStringPromise } from 'xml2js';
import { parse } from 'path';

@Injectable()
export class TradeService {
    [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,

    
  ) {}
 

  
  async  getData( @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  const ORGANCODE = 'e4d88b73-c523-440a-b60f-b243bfdfc540';
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const nextMonth = String(now.getMonth() + 2).padStart(2, '0');

  let StartDate = `${currentYear}-${currentMonth}-01`;
  let EndDate = `${currentYear}-${currentMonth}-31`;
  
  
  if (parseInt(nextMonth) > 12) {
    EndDate = `${currentYear + 1}-01-05`;
  }

  const STARTDATE = StartDate;
  const ENDDATE = EndDate;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetPaperlessData xmlns="http://tempuri.org/">
          <DataRequest>
            <OrganizeCode>${ORGANCODE}</OrganizeCode>
            <StartDate>${STARTDATE}</StartDate>
            <EndDate>${ENDDATE}</EndDate>
          </DataRequest>
        </GetPaperlessData>
      </soap:Body>
    </soap:Envelope>`;

  const options = {
    hostname: 'smart-1.dft.go.th',
    path: '/WebServices/DFTLicenseData.asmx',
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(xml),
      'SOAPAction': '"http://tempuri.org/GetPaperlessData"',
    },
  };

  const soapRequest = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const req = https.request(options, (soapRes) => {
        let data = '';
        soapRes.on('data', (chunk) => (data += chunk));
        soapRes.on('end', () => resolve(data));
      });

      req.on('error', (err) => reject(err));
      req.write(xml);
      req.end();
    });

  try {
    const rawXML = await soapRequest();
    const result = await parseStringPromise(rawXML, { explicitArray: false });

    const parsedList = result['soap:Envelope']['soap:Body']['GetPaperlessDataResponse']['GetPaperlessDataResult']['LicenseHeader'];

    const dataGovList: any[] = [];
    const licenseDetailList: any[] = [];

    for (const item of parsedList) {
    
        const exists = await this.prisma.dataFromGoverment.findUnique({
    where: {   fullLicenseNumber : item.LicenseNumber },
  });

  if (!exists) {
    
   
  
      const dataID = crypto.randomUUID();

      dataGovList.push({
        dataID,
        fullLicenseNumber: item.LicenseNumber, // Remove non-numeric characters
        licenseNumber: item.LicenseNumber.replace(/\D/g, ''),
        exporter: item.Exporter,
        recipient: item.Recipient,
        buyer: item.Buyer || null,
        exportAgent: item.Export_Agent,
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

        if(!existsDetail ){
        licenseDetailList.push({
          permitId: dataID,
          licenseNumber : item.LicenseNumber.replace(/\D/g, ''),
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
          productDescription: detail.ProductDescription,
        });
    }
      }
    }
}
else{
    console.log(`🔁 Skip: ${item.LicenseNumber} already exists`);
  
}
    }

    await this.prisma.dataFromGoverment.createMany({ data: dataGovList, skipDuplicates: true });
    await this.prisma.licenseDetail.createMany({ data: licenseDetailList });
   console.log(licenseDetailList);
    return response.status(200).send({
      message: '✅ Data fetched and saved from SOAP service',
      inserted: parsedList,
    });
  } catch (err: any) {
    console.error('SOAP Error:', err);
    return response.status(500).send({
      message: '❌ Failed to fetch SOAP data',
      error: err.message || err,
    });
  }
}
  
async licensequery (licenseNo, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
){
try {
  const newLicenNo =  licenseNo;
  console.log(newLicenNo);
  
  const querydata = await this.prisma.dataFromGoverment.findFirst({
    where: { licenseNumber: newLicenNo },
    include: {
     licenseDetails   : true, // Assuming relation name is LicenseDetail
    },
  });
   if(!querydata){
    throw new NotFoundException('No License Data')
   }
   return {
        message: 'Logged in sucessfully',
        querydata
      };
} catch (error) {
   return {error}
}
}


async createOrder(body: any,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const adddata = await this.prisma.request.create({
      data: {
        companyName: body.companyName,
        requestBy: body.requestBy,
        requestDate: new Date(body.requestDate),
        shippingDateTime: new Date(body.shippingDateTime),
        surveyLocateNameThai: body.surveyLocateNameThai,
        surveyLocateNameEng: body.surveyLocateNameEng,
        surveyPaidBy: body.surveyPaidBy,
        surveyProvince: body.surveyProvince,
        surveySubDistrict: body.surveySubDistrict,
        telInspector: body.telInspector,
        telDebtor: body.telDebtor,
        licenseNumber: body.licenseNumber,
        status: "incomplete",
        
       
        descriptions: {
          create: body.description.map((desc: any) => ({
            descriptionID: desc.descriptionID,
            destination: desc.destination,
            riceType: desc.riceType,
            vehicleName: desc.vehicleName,
            marker: desc.marker,
            licenseNumber: body.licenseNumber,
            quantity: desc.quantity,
            quantityUnit: desc.quantityUnit,
            grossWeight: desc.grossWeight,
             netWeight: desc.netWeight,
         
      
           
            
          })),
        },
      },
    });

    // ส่ง response กลับ client ว่าสร้างสำเร็จ
    return response.status(200).send({
      success: true,
   
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);

    // ส่ง error กลับ client
    return response.status(500).send({
      success: false,
      message: 'Failed to create order',
      error: error.message || error,
    });
  }
}

async getRequestbydate(date: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return response.status(400).send({
        success: false,
        message: 'Invalid date format',     
      });
    }
    const request = await this.prisma.request.findMany({
      where: {
        requestDate: {
          gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
          lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
        },
      },
      include: {
        descriptions: true, // Include related descriptions
      },
    });
    if (!request || request.length === 0) {
      return response.status(404).send({
        success: false,
        message: 'No requests found for the given date',
      });
    }
    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error('Error fetching request by date:', error);
    return response.status(500).send({
      success: false,
      message: 'Failed to fetch request by date',
      error: error.message || error,
    });
  }
}

  async getRequest(requestID, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
){
    try {
      const request = await this.prisma.request.findUnique({
        where: { requestID: requestID },
        include: {
          descriptions: true, // Include related descriptions
        },
      });
      if (!request) {
        return response.status(404).send({
          success: false,
          message: 'Request not found',
        });
      }
      return response.status(200).send({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error('Error fetching request:', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to fetch request',
        error: error.message || error,
      });
      
    }
  }

async deleteOrder(orderID, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    // ตรวจสอบว่ามี order ที่ต้องการลบหรือไม่
    const existingOrder = await this.prisma.request.findUnique({
      where: { requestID: orderID },
    });

    if (!existingOrder) {
      return response.status(404).send({
        success: false,
        message: 'Order not found',
      });
    }
    const findOrder = await this.prisma.validate_Check_Weight.findFirst({
      where: { descriptionID: orderID },
    })
    if (findOrder) {
      return response.status(400).send({
        success: false,
        message: 'Order is submitted already cannot delete',
      });
    }
   console.log(findOrder);
    // ลบ order
   await this.prisma.description.deleteMany({
  where: { requestId: orderID },
});

await this.prisma.request.delete({
  where: { requestID: orderID },
});


    // ส่ง response กลับ client ว่าลบสำเร็จ
    return  response.status(200).send({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    

    // ส่ง error กลับ client
    return response.status(500).send({
      success: false,
      message: 'Failed to delete order',
      error: error.message || error,
    });
  }

}

async deleteOrderDetail(descriptionID,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const checkWeight = await this.prisma.validate_Check_Weight.findFirst({
      where: { descriptionID: descriptionID },
    });
    console.log(checkWeight);
    if (checkWeight) {
      return response.status(400).send({
        success: false,
        message: 'Cannot delete order detail, it has been submitted for weight check',
      });
    }
    // ตรวจสอบว่ามี order ที่ต้องการลบหรือไม่
    const existingOrder = await this.prisma.description.findUnique({
      where: { descriptionID: descriptionID },
    });
    console.log(existingOrder);
    if (!existingOrder) {
      return response.status(404).send({
        success: false,
        message: 'Order not found',
      });
    }
    //  await this.prisma.description.deleteMany({
    //   where: { descriptionID  : existingOrder. },
    // });
    // ลบ order

await this.prisma.description.delete({
  where: { descriptionID: descriptionID },
});


    // ส่ง response กลับ client ว่าลบสำเร็จ
    return response.status(200).send({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);

    // ส่ง error กลับ client
    return response.status(500).send({
      success: false,
      message: 'Failed to delete order',
      error: error.message || error,
    });
  }

}
async updateOrder(id, body: any,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
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
    };
    console.log(updateRequestData);
    console.log(id);
    // 1. ตรวจว่ามี field ที่เป็นของ request ไหม
    const hasRequestData = Object.values(updateRequestData).some((val) => val !== undefined);


    if (hasRequestData) {
      await this.prisma.request.update({
      where: { requestID: String(id) },
        data: updateRequestData,
      });
    }

    
    if (Array.isArray(body.description)) {
    
      for (const desc of body.description) {
        if (desc.descriptionID) {
          const existing = await this.prisma.description.findUnique({
            where: { descriptionID: desc.descriptionID },
          });
          console.log(desc)
          if (existing) {
            await this.prisma.description.update({
              where: { descriptionID: desc.descriptionID },
              data: {
                ...desc,
              },
            });
          } else {
            await this.prisma.description.create({
              data: {
                ...desc,
                requestID: id, // อย่าลืมใส่ relation กลับไปที่ request
              },
            });
          }
        }
      }
    }

    return {
      success: true,
      message: 'Order updated successfully',
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return response.status(500).send({
      success: false,
      message: 'Failed to update order',
      error: error.message || error,
    });
  }
}



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
