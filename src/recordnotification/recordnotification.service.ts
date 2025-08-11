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
    request: true,
  },
});
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
        checkweightdata?.jobID

     const dataToUpdate = { ...checkweightdata, ...dto };
     

if (dto.shippingDate) {
  dataToUpdate.shippingDate = new Date(dto.shippingDate);
}

const updatedData = await this.prisma.validate_Check_Weight.update({
  where: { checkWeightID },
  data: dataToUpdate,
});

      if (updatedData) {
        const addcertificatesheet = await this.prisma.certificatesheet.create({
          data: {
            jobID: checkweightdata?.jobID || '11796',
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
    const postdata = await this.prisma.validate_Check_Weight.createMany({
      data: dtoArray.map((dto) => ({
        descriptionID: dto.descriptionID,
        requestID: dto.requestID,
        status: false,
        staffID: dto.staffID,
        jobID: dto.jobID,
      })),
    });

    return {
      message: 'Posted check weight data successfully',
      data: postdata,
    };
  } catch (error) {
    return response.status(500).send({
      message: 'Failed to post data',
      error: error.message || error,
    });
  }
}


  async getCheckWeightData(checkWeightID: string,  @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
    try {
      const checkWeightData = await this.prisma.validate_Check_Weight.findMany({
        where: {
          checkWeightID: checkWeightID,
        },
        include: {
          description: true, // Fetch related Description
          request: true, // Fetch related Request
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
}
