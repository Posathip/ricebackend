import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import {
  updateCheckWeightData,
  ValidateCheckWeightDto,
} from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
@Injectable()
export class RecordnotificationService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async updateCheckWeightData(
    checkWeightID: string,
    dto: updateCheckWeightData,
    req: Request,
    res: Response,
  ) {
    try {
      const checkweightdata =
        await this.prisma.validate_Check_Weight.findUnique({
          where: { checkWeightID: checkWeightID },
        });

      const updatedData = await this.prisma.validate_Check_Weight.update({
        where: { checkWeightID: checkWeightID },
        data: {
          loadingDetail1: dto.loadingDetail1,
          time: dto.time,
          bagQuantity: dto.bagQuantity,
          grossWeight: dto.grossWeight,
          jobID: dto.jobID,
          descriptionID: dto.descriptionID,
          netWeight: dto.netWeight,
          quantity: dto.quantity,
          requestID: dto.requestID,
          riceTypeID: dto.riceTypeID,
          shippingDate: dto.shippingDate,
          staffID: dto.staffID,
          statusContinue: dto.statusContinue,
          status: true,
          companyName: dto.companyName,
        },
      });

      if (updatedData) {
        const addcertificatesheet = await this.prisma.certificatesheet.create({
          data: {
            jobID: checkweightdata?.jobID || '11796',
          },
        });
      }

      return res.status(200).send({
        message:
          'Check weight data and addcertificatesheetalready updated successfully',
        data: updatedData,
      });
    } catch (error) {
      return res.status(500).send({
        message: 'Failed to update check weight data',
        error: error.message || error,
      });
    }
  }

  async postData(dto: ValidateCheckWeightDto, req: Request, res: Response) {
    try {
      const postdata = await this.prisma.validate_Check_Weight.create({
        data: {
          descriptionID: dto.descriptionID,
          requestID: dto.requestID,
          status: false,
          staffID: dto.staffID,
          jobID: dto.jobID,
        },
      });
      return { message: 'post check weight data successfully', data: postdata };
    } catch (error) {
      return res.status(500).send({
        message: 'Failed to post data',
        error: error.message || error,
      });
    }
  }

  async getCheckWeightData(checkWeightID: string, req: Request, res: Response) {
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
        return res
          .status(404)
          .send({ message: 'No data found for the given check weight ID' });
      }

      return res
        .status(200)
        .send({
          message: 'Check weight data retrieved successfully',
          data: checkWeightData,
        });
    } catch (error) {
      return res.status(500).send({
        message: 'Failed to retrieve check weight data',
        error: error.message || error,
      });
    }
  }
}
