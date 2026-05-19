import { Inject, Injectable, NotFoundException, Req, Res } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import { stripPrefix } from 'xml2js/lib/processors'
import * as https from 'https'; // สำหรับ HTTPS request
import * as http from 'http'; // สำหรับ fallback HTTP
import { parseStringPromise } from 'xml2js';
import { parse } from 'path';
import { CreateSurveyDto } from 'src/dto/user.dto';
import { CreateOrderDto } from 'src/dto/request.dto';

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

// วันที่ปัจจุบัน
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // (1–12)

// ฟังก์ชันหาวันสุดท้ายของเดือน
const getLastDayOfMonth = (year, month) => new Date(year, month, 0).getDate();

// กำหนดวันเริ่มต้นของเดือนนี้
const StartDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

// กำหนดวันสุดท้ายของเดือนนี้ (ครอบคลุมทุกเดือน)
const lastDay = getLastDayOfMonth(currentYear, currentMonth);

// ถ้าเป็นธันวาคม → เดือนถัดไปคือมกราคมปีใหม่
let EndDate;
if (currentMonth === 12) {
  EndDate = `${currentYear + 1}-01-05`;
} else {
  EndDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

// เพิ่มเวลาแบบมาตรฐาน ISO (บาง SOAP ต้องใช้)
const STARTDATE = `${StartDate}T00:00:00`;
const ENDDATE = `${EndDate}T00:00:00`;

console.log('StartDate:', STARTDATE);
console.log('EndDate:', ENDDATE);


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
    
    console.log(rawXML);
    const parsedList = result['soap:Envelope']['soap:Body']['GetPaperlessDataResponse']['GetPaperlessDataResult']['LicenseHeader'];
    console.log(parsedList)
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
        
        exporter: cleanCompanyName(item.Exporter),
        exporterNoCut: item.Exporter || null,
        recipient: item.Recipient,
        telephone : extractTelephone(item.Exporter),
        buyer: item.Buyer || null,
         exportAgent: extractFirstName(item.Export_Agent),
        // exportAgent: item.Export_Agent || null,
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
        const netWeightW = parseFloat(detail.NetWeightKGM) / parseFloat(detail.Quantity) ;
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
          productDescription: cleanRiceType(detail.ProductDescription),
          productDescriptionNotCut: detail.ProductDescription,
          netWeightW :  netWeightW,
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
        message: 'Get data  sucessfully',
        querydata
      };
} catch (error) {
   return {error}
}
}


async createOrder(dto: CreateOrderDto, @Res({ passthrough: true }) response: FastifyReply) {
  try {

    const getdata = await this.prisma.dataFromGoverment.findUnique({
      where: { licenseNumber: dto.licenseNumber },
      include: {
        licenseDetails: true,
      },
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
        status: "incomplete",
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
      }));

    if (bufferRemainList.length > 0) {
      await this.prisma.bufferRemain.createMany({ data: bufferRemainList, skipDuplicates: true });
    }

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
      error:  error,
    });
  }
}

// async getRequestbydate(date: string,  @Req() request: any,
//     @Res({ passthrough: true }) response: FastifyReply,
// ) {
//   try {
//     const parsedDate = new Date(date);
//     if (isNaN(parsedDate.getTime())) {
//       return response.status(400).send({
//         success: false,
//         message: 'Invalid date format',     
//       });
//     }
//     // Get requests for the given date
//     const request = await this.prisma.request.findMany({
//       where: {
//       requestDate: {
//         gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
//         lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
//       },
      
//       },
      
//       select: {
//     requestID: true,
//     companyName: true,
//     status: true,
//     surveySubDistrict: true,
   
//     descriptions:{
//       select: {
//         index: true,
//         descriptionID: true,
//         licenseNumber: true,
//         riceType: true,
//         quantity: true,
//         destination: true,
//         vehicleName: true,
//         netWeightTON: true,
        
        
//     },
//      orderBy: [
//         { licenseNumber: 'asc' },
//         { riceType: 'asc' },
//         { quantity: 'asc' },
//         { vehicleName: 'asc' },
//         { destination: 'asc' },
//       ],
//   },
//     surveyLocateNameEng: true,
//     surveyLocateNameThai: true,
//     surveyProvince: true,
//     shippingDateTime: true,  
//   },
     
//       orderBy: {
//     createdAt: 'asc'
//   },
//     });


//     const  requestMap = request.map(r => ({
//   ...r,
//   surveyLocateNameThai: `${r.surveyLocateNameThai ?? ''}-${r.surveyProvince ?? ''}`.trim(), companyNameEng: '',
// }));
// console.log(requestMap);
//     const result = await Promise.all(
//   requestMap.map(async (req) => {
//     const latestJob = await this.prisma.validate_Check_Weight.findFirst({
//       where: { requestID: req.requestID },
//       orderBy: { jobID: 'desc' },
//       select: { jobID: true },
//     });

//     return {
//       ...req,
//       jobID: latestJob?.jobID ?? null, 
//     };
//   })
// );

  

//     // Get requests for the previous day (date - 1)
//     // const prevDate = new Date(parsedDate);
//     // prevDate.setDate(parsedDate.getDate() - 1);
//     // console.log(prevDate);
//     const prevRequest = await this.prisma.validate_Check_Weight.findFirst({
//       // where: {
//       // createdAt: {
//       //   gte: new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate()),
//       //   lt: new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1),
//       // },
//       // },
      
//       orderBy: {
//     jobID: 'desc',
//   },
//   select: {
//     jobID: true, // only return jobID
//   },
//   take: 1, // ensure only one record
//     });
//     if (!request || request.length === 0) {
//       return response.status(404).send({
//         success: false,
//         message: 'No requests found for the given date',
//         finalNo: prevRequest?.jobID || "0000",
//       });
//     }
//     return response.status(200).send( {
//       success: true,
//       data: result,
//       finalNo: prevRequest?.jobID || "0000",
//     });
//   } catch (error) {
//     console.error('Error fetching request by date:', error);
//     return response.status(500).send({
//       success: false,
//       message: 'Failed to fetch request by date',
//       error: error,
//     });
//   }
// }

async getRequestbydate(date: string, @Req() req: any, @Res({ passthrough: true }) response: FastifyReply) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return response.status(400).send({
        success: false,
        message: 'Invalid date format',
      });
    }

    // 1. ดึงข้อมูลจากตาราง Request
    const requests = await this.prisma.request.findMany({
      where: {
        requestDate: {
          gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
          lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
        },
      },
      select: {
        requestID: true,
        companyName: true, // ใช้ตัวนี้ไปค้นหาในตาราง Company
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
            {index: 'asc'},
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
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. [ดึงข้อมูล Company] รวบรวมชื่อบริษัททั้งหมดแล้ว Query ทีเดียว
    const companyNames = [...new Set(requests.map((r) => r.companyName))].filter(Boolean);
    const companies = await this.prisma.company.findMany({
      where: {
        companyNameTH: { in: companyNames },
      },
      select: {
        companyNameTH: true,
        companyNameEN: true,
      },
    });

    // 3. [ดึงข้อมูล JobID] และประกอบร่างข้อมูล
    const result = await Promise.all(
      requests.map(async (r) => {
        // หาค่า companyNameEN จาก Array ที่เราดึงมารอไว้แล้ว
        const foundCompany = companies.find((c) => c.companyNameTH === r.companyName);

        // หา jobID ล่าสุด
        const latestJob = await this.prisma.validate_Check_Weight.findFirst({
          where: { requestID: r.requestID },
          orderBy: { jobID: 'desc' },
          select: { jobID: true },
        });

        return {
          ...r,
          surveyLocateNameThai: `${r.surveyLocateNameThai ?? ''}-${r.surveyProvince ?? ''}`.trim(),
          companyNameEng: foundCompany?.companyNameEN ?? '', // ใส่ค่า EN ที่หาเจอ
          jobID: latestJob?.jobID ?? null,
        };
      })
    );

    // 4. หาเลขรันล่าสุดตัวสุดท้าย
    const prevRequest = await this.prisma.validate_Check_Weight.findFirst({
      orderBy: { jobID: 'desc' },
      select: { jobID: true },
    });

    if (!requests || requests.length === 0) {
      return response.status(404).send({
        success: false,
        message: 'No requests found for the given date',
        finalNo: prevRequest?.jobID || "0000",
      });
    }

    return response.status(200).send({
      success: true,
      data: result,
      finalNo: prevRequest?.jobID || "0000",
    });

  } catch (error) {
    console.error('Error fetching request by date:', error);
    return response.status(500).send({
      success: false,
      message: 'Failed to fetch request by date',
      error: error,
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
        error:  error,
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
      error:  error,
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
      error:  error,
    });
  }

}
async updateOrder(id, body: any,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const updateRequestData = {
      companyName:  body.companyName,
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
      payer: body.payer
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
      error:  error,
    });
  }
}

async postSurvey(dto: CreateSurveyDto[],  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
    const surveyData = await this.prisma.surveyName.createMany({
       data: dto.map((dto) => ({
           amphoes: dto.amphoes || "-",
            changwat: dto. changwat || "-",
           surveyNameEN: dto.surveyNameEN ||"-",
            surveyNameTH: dto.surveyNameTH|| "-",
           
      })),
    });

    return response.status(200).send({
      success: true,
      message: 'Survey posted successfully',
   
    });
  } catch (error) {
    console.error('Error posting survey:', error);
    return response.status(500).send({
      success: false,
      message: 'Failed to post survey',
      error:  error,
    });
  }
}

async getInspectPlace( @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
    try {
      const getInspectPlace = await this.prisma.surveyName.findMany({
        select: {
          surveyNameTH: true,
          surveyNameEN: true,
          changwat: true,
          amphoes: true,
        },
        distinct: ['surveyNameTH', 'surveyNameEN'],
        orderBy: {  
          surveyNameTH: 'asc',
        },
      });
      return response.status(200).send({
        success: true,
        data: getInspectPlace,
      });
    } catch (error) {
      console.error('Error fetching inspect places:', error);
      return response.status(500).send({
        success: false,
        message: 'Failed to fetch inspect places',
        error:  error,
      });

    }

}

async getlicensebyDate(startdate: string, enddate: string, @Req() request: any,

    @Res({ passthrough: true }) response: FastifyReply,
) {
    const ORGANCODE = 'e4d88b73-c523-440a-b60f-b243bfdfc540';
  const xml = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetPaperlessData xmlns="http://tempuri.org/">
            <DataRequest>
              <OrganizeCode>${ORGANCODE}</OrganizeCode>
              <StartDate>${startdate}</StartDate>
              <EndDate>${enddate}</EndDate>
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
      const parsed = await parseStringPromise(rawXML, { explicitArray: false });

      const responseData =
        parsed['soap:Envelope']?.['soap:Body']?.['GetPaperlessDataResponse']?.['GetPaperlessDataResult']?.['LicenseHeader'] ?? null;

      return response.status(200).send({
        message: '✅ Data fetched from SOAP service',
        data: responseData,
      });
    } catch (err: any) {
      console.error('SOAP Error:', err);
      return response.status(500).send({
        message: '❌ Failed to fetch SOAP data',
        error: err.message || err,
      });
    }
  }
}

function cleanRiceType(riceType: string): string {
  if (!riceType) return riceType;

  // ถ้ามี %
  const percentIndex = riceType.indexOf("%");
  if (percentIndex !== -1) {
    return riceType.substring(0, percentIndex + 1).trim(); 
  }

  // ถ้าไม่มี % แต่มีคำว่า "บรรจุ"
  const packIndex = riceType.indexOf("บรรจุ");
  if (packIndex !== -1) {
    return riceType.substring(0, packIndex).trim();
  }

  // ถ้าไม่มีทั้งสองอย่าง
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

  // ตัดคำว่า "บริษัท" (พร้อมช่องว่างหลัง ถ้ามี)
  companyName = companyName.replace(/^บริษัท\s*/, "");

  const index = companyName.indexOf("จำกัด");
  if (index !== -1) {
    // เก็บไว้จนถึงคำว่า "จำกัด"
    return companyName.substring(0, index + "จำกัด".length).trim();
  }

  return companyName.trim();
}


function extractTelephone(text: string): string {
  const match = text.match(/Tel\.?\s*([0-9]+)/);
  return match ? match[1].trim() : '';
}

function extractFirstName(text: string): string {
  // ลิสต์คำนำหน้าที่ต้องการรองรับ
   const prefixes = ['ว่าที่ร้อยตรี', 'นางสาว', 'นาง', 'นาย'];
  // สร้าง regex ที่ match ได้ทั้ง 4 แบบ โดยไม่แคร์ช่องว่าง
  const regex = new RegExp(`^(?:${prefixes.join('|')})\\s*([\\u0E00-\\u0E7Fa-zA-Z]+)`, 'u');

  const match = text.match(regex);
  return match ? match[1].trim() : '';
}