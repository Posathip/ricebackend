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
        error: error.message || error,
      });
    }
  }

  async getCheckWeightDataFilterDate(date,@Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,){
      try {
        const parsedDate = new Date(date);
        console.log('Parsed Date:', parsedDate);
        const checkWeightDatafilterbydate = await this.prisma.validate_Check_Weight.findMany({
  where: {
    request: {
      requestDate: {
        gte:  new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
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

    // const modifiedData = checkWeightDatafilterbydate.map(item => ({
    //   ...item,
    //   request: {
    //     ...item.request,
    //     companyName: item.request.companyName?.replace(/จำกัด/g, '').trim(),
    //   },
    // }));

    
      if(!checkWeightDatafilterbydate || checkWeightDatafilterbydate.length === 0) {
        return response.status(404).send({
          message: 'No check weight data found for the given date',
        });
      } 
      return response.status(200).send({
        message: 'Check weight data retrieved successfully by date',
        data: checkWeightDatafilterbydate,
      });
      } catch (error) {
        return response.status(500).send({
          message: 'Failed to retrieve check weight data by date',
          error: error.message || error,
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
            jobID: checkweightdata?.jobID || 0,
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
        error: error.message || error,
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
    error: error.message || error,
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
          error: error.message || error,
        });
      }
  }
}
