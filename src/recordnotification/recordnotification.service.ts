import { Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import {
  UpdateCheckWeightData,
  ValidateCheckWeightDto,
} from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
import { FastifyReply } from 'fastify';
@Injectable()
export class RecordnotificationService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getCheckWeightData(checkWeightID: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
    try {
      const checkWeightData = await this.prisma.validate_Check_Weight.findMany({
        where: {
          checkWeightID: checkWeightID,
        },
        include: {
          description: {
            select:{destination : true,
            vehicleName: true,}
            
          },
          
          request:{
            select:{
              licenseNumber: true,
              shippingDateTime: true,
              requestBy : true,
            }
          }
        },
      });

      if (!checkWeightData || checkWeightData.length === 0) {
        return response
          .status(404)
          .send({ message: 'No data found for the given check weight ID' });
      }

      return response
        .status(200)
        .send({
          message: 'Check weight data retrieved successfully',
          data: checkWeightData,
        });
    } catch (error) {
      return response.status(500).send({
        message: 'Failed to retrieve check weight data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getCheckWeightDataFilterDate(date: string, @Req() req: any, @Res({ passthrough: true }) response: FastifyReply) {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return response.status(400).send({ message: 'Invalid date format' });
    }

    // 1. ดึงข้อมูล Validate_Check_Weight โดยกรองจากวันที่ในตาราง Request
    const checkWeightData = await this.prisma.validate_Check_Weight.findMany({
      where: {
        request: {
          requestDate: {
            gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
            lt: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + 1),
          }
        }
      },
      include: {
        request: {
          select: {
            licenseNumber: true,
            surveyLocateNameThai: true,
            surveyLocateNameEng: true,
            companyName: true, // ต้องดึงมาเพื่อใช้หาชื่อภาษาอังกฤษ
          },
        },
        description: {
          select: {
            destination: true,
          }
        }
      },
      orderBy: [
        { jobID: 'asc' },
        { specialJob: 'asc' },
      ],
    });

    if (!checkWeightData || checkWeightData.length === 0) {
      return response.status(404).send({
        message: 'No check weight data found for the given date',
      });
    }

    // 2. [Gather] รวบรวมชื่อบริษัททั้งหมดที่มีในผลลัพธ์
    const companyNames = [...new Set(checkWeightData.map(cw => cw.request?.companyName))].filter(Boolean);

    // 3. [Fetch] ดึงข้อมูลจากตาราง Company มาทีเดียว
    const companies = await this.prisma.company.findMany({
      where: {
        companyNameTH: { in: companyNames },
      },
      select: {
        companyNameTH: true,
        companyNameEN: true,
      }
    });

    // 4. [Map] ประกอบร่างข้อมูล (เหมือเดิมคือเพิ่ม companyNameEn และ Clean ชื่อบริษัทถ้าต้องการ)
    const result = checkWeightData.map(item => {
      const foundCompany = companies.find(c => c.companyNameTH === item.request?.companyName);
      
      return {
        ...item,
        request: {
          ...item.request,
          // แถม: ลบคำว่า "จำกัด" ออกตาม Logic ที่คุณเคย Comment ไว้
          companyName: item.request?.companyName?.replace(/จำกัด/g, '').trim() || '',
          companyNameEn: foundCompany?.companyNameEN ?? '',
        },
      };
    });

    return response.status(200).send({
      message: 'Check weight data retrieved successfully by date',
      data: result,
    });

  } catch (error) {
    console.error(error);
    return response.status(500).send({
      message: 'Failed to retrieve check weight data by date',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

  async updateCheckWeightData(
    checkWeightID: string,
     dto: UpdateCheckWeightData,
     @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,

  ) {
    try {
      const checkweightdata =
        await this.prisma.validate_Check_Weight.findUnique({
          where: { checkWeightID: checkWeightID },
        });
     console.log(checkweightdata);

     const getlicense =
  await this.prisma.validate_Check_Weight.findUnique({
    where: { checkWeightID: checkWeightID },
    include: {
      request: true,
      description: true,
    },
  });
     const dataToUpdate = { ...checkweightdata, ...dto };
     

// if (dto.shippingDate) {
//   dataToUpdate.shippingDate = new Date(dto.shippingDate);
// }

const updatedData = await this.prisma.validate_Check_Weight.update({
  where: { checkWeightID },
  data: dataToUpdate,
});

      if (updatedData) {
        const addcertificatesheet = await this.prisma.certificatesheet.create({
          data: {
            checkWeightID : updatedData.checkWeightID,
            jobID: checkweightdata?.jobID || 0,
            licenseNumber: getlicense?.request.licenseNumber || '',
            index: getlicense?.description.index || 0,
            specialJob: getlicense?.specialJob || '',
            companyName: getlicense?.request.companyName || '',
            surveyLocateNameThai : getlicense?.request.surveyLocateNameThai || '',
           
             portName  : getlicense?.request.portName || '',
             destination : getlicense?.description.destination || '',
             riceType : getlicense?.description.riceType || '',
              quantity : getlicense?.description.quantity || 0,
             totalGrossWeight : updatedData?.totalGrossWeight|| 0,
             totalTareWeight :updatedData?.totalTareWeight || 0,
              totalNettWeight : updatedData?.totalNetWeight || 0,
             shipper : getlicense?.request.requestBy || '',
             dateCheckWeight : getlicense?.request.requestDate || new Date(),
             marks: 'xxxxxxx',
            status : false,
          },
        });
      }

      return response.status(200).send({
        message:
          'Check weight data and addcertificatesheet already updated successfully',
        data: updatedData,
      });
    } catch (error) {
      return response.status(500).send({
        message: 'Failed to update check weight data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async postData(dtoArray: ValidateCheckWeightDto[],  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
  try {
  const requestIds = dtoArray.map((dto) => dto.requestID);
  const descriptionIds = dtoArray.map((dto) => dto.descriptionID);

  // 1️⃣ Check existing records
  const existingRecords = await this.prisma.validate_Check_Weight.findMany({
    where: {
      descriptionID: { in: descriptionIds },
    },
    select: { descriptionID: true },
  });

  const existingDescriptionIds = new Set(
    existingRecords.map((r) => r.descriptionID)
  );

  // 2️⃣ Fetch related data (for insert logic)
  const requests = await this.prisma.request.findMany({
    where: { requestID: { in: requestIds } },
  });

  const descriptions = await this.prisma.description.findMany({
    where: { descriptionID: { in: descriptionIds } },
  });

  const descriptionMap = new Map(descriptions.map((d) => [d.descriptionID, d]));
  const requestMap = new Map(requests.map((r) => [r.requestID, r]));

  // 3️⃣ Loop through DTOs
  for (const dto of dtoArray) {
    if (existingDescriptionIds.has(dto.descriptionID)) {
      // === UPDATE existing record ===
      const desc = descriptionMap.get(dto.descriptionID);
      const req = requestMap.get(dto.requestID);

      const updatePayload: any = {
        status: false,
        staffID: dto.staffID,
        jobID: dto.jobID,
        note: dto.note,
        statusContinue: dto.statusContinue,
        staffName: dto.staffName,
        specialJob: dto.specialJob || null,
      };

      if (desc) {
        updatePayload.vehicleName = desc.vehicleName;
        updatePayload.riceName = desc.riceType;
        updatePayload.noOfBags = desc.quantity;
        updatePayload.grossWeight = desc.grossWeight;
        updatePayload.netWeightW = desc.netWeightW;
        updatePayload.netWeightTon = desc.netWeightTON;
      }

      if (req) {
        updatePayload.goDown = req.portName;
        updatePayload.time = req.shippingDateTime;
        updatePayload.supplierName = req.companyName;
      }

      await this.prisma.validate_Check_Weight.updateMany({
        where: { descriptionID: dto.descriptionID },
        data: updatePayload,
      });
    } else {
      // === CREATE new record (original logic) ===
      const desc = descriptionMap.get(dto.descriptionID);
      const req = requestMap.get(dto.requestID);

      await this.prisma.validate_Check_Weight.create({
        data: {
          descriptionID: dto.descriptionID,
          requestID: dto.requestID,
          status: false,
          staffID: dto.staffID,
          jobID: dto.jobID,
          note: dto.note,
          statusContinue: dto.statusContinue,
          staffName: dto.staffName,
          specialJob: dto.specialJob || null,
          vehicleName: desc?.vehicleName || null,
          riceName: desc?.riceType || null,
          noOfBags: desc?.quantity || null,
          grossWeight: desc?.grossWeight || null,
          netWeightW: desc?.netWeightW || null,
          netWeightTon: desc?.netWeightTON || null,
          goDown: req?.portName || null,
          time: req?.shippingDateTime || null,
          supplierName: req?.companyName || null,
        },
      });
    }
  }

  // 4️⃣ Update request status
  await this.prisma.request.updateMany({
    where: { requestID: { in: requestIds } },
    data: { status: 'completed' },
  });

  return {
    message: 'Successfully processed check weight data',
    updated: Array.from(existingDescriptionIds).length,
    created: dtoArray.length - existingDescriptionIds.size,
  };
} catch (error) {
  return response.status(500).send({
    message: 'Failed to post or update data',
    error: error instanceof Error ? error.message : String(error),
  });
}
}
  async getCheckWeightDataFilterjobNoandid(jobNo: number,licenseId: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,){

      try {
        const query = await this.prisma.validate_Check_Weight.findMany({
          where: {
            OR: [
              { jobID: jobNo },
              { request: { licenseNumber: licenseId } },
            ],
          },
          include: {
            request: true,
          },
        });
        if (!query || query.length === 0) {
          return response.status(404).send({
            message: 'No check weight data found for the given jobNo and licenseId',
          });
        }
        return response.status(200).send({
          message: 'Check weight data retrieved successfully by jobNo and licenseId',
          data: query,
        });
      } catch (error) {
        return response.status(500).send({
          message: 'Failed to retrieve check weight data by jobNo and licenseId',
          error: error instanceof Error ? error.message : String(error),
        });
      }
  }
}
