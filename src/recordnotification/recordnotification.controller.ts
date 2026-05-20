import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import {
  UpdateCheckWeightData,
  ValidateCheckWeightDto,
} from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
import { FastifyReply } from 'fastify';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
@Controller('recordnotification')
export class RecordnotificationController {
  constructor(
    private readonly recordnotificationService: RecordnotificationService,
  ) {}
  @ApiOperation({ summary: 'Post Check Weight Data' })
  @ApiBody({ type: [ValidateCheckWeightDto] })
  @ApiResponse({ status: 200, description: 'Post Data Check Weight Complete.' })
  @Post('postdata')
  postdata(
    @Body() dto: ValidateCheckWeightDto[],
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.postData(dto, request, response);
  }
  @ApiOperation({ summary: 'Get All Check Weight Data' })
  @ApiResponse({
    status: 200,
    description: 'Get all check weight data successfully.',
  })
  @Get('getallcheckweightdata')
  getAllCheckWeightData(
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.getAllCheckWeightData(
      request,
      response,
    );
  }

  @ApiOperation({ summary: 'Get Check Weight Data by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get check weight data by ID successfully.',
  })
  @ApiQuery({
    name: 'checkWeightID',
    required: true,
    type: String,
    description: 'ID of the check weight record',
    example: '12323214214',
  })
  @Get('getcheckweightdata')
  getCheckWeightData(
    @Query('checkWeightID') checkWeightID: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.getCheckWeightData(
      checkWeightID,
      request,
      response,
    );
  }

  @ApiOperation({ summary: 'Get Check Weight Data by ID FilterBydate' })
  @ApiResponse({
    status: 200,
    description: 'Get check weight data by Date successfully.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: Date,
    description: 'Filter Date',
  })
  @Get('getcheckweightdatafilterbydate')
  getCheckWeightDatafilterDate(
    @Query('date') date: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.getCheckWeightDataFilterDate(
      date,
      request,
      response,
    );
  }
  @ApiOperation({ summary: 'Update Check Weight Data' })
  @ApiResponse({
    status: 200,
    description: 'Update check weight data by Date successfully.',
  })
  @ApiBody({ type: UpdateCheckWeightData })
  @ApiQuery({
    name: 'checkweightid',
    required: true,
    type: String,
    description: 'Filter Date',
  })
  @Put('updatecheckweightdata')
  updatecheckweightdata(
    @Query('checkweightid') checkWeightID: string,
    @Body() dto: UpdateCheckWeightData,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.updateCheckWeightData(
      checkWeightID,
       dto,
      request,  
      response,
    );
  }

  @ApiOperation({ summary: 'Get License History by License Number' })
  @ApiResponse({
    status: 200,
    description: 'Get license history successfully.',
    schema: {
      example: {
        message: 'License history retrieved successfully',
        govData: {
          licenseNumber: '0308116917947',
          exporter: 'ซี.พี.อินเตอร์เทรด จำกัด',
          exporterNoCut: 'ซี.พี.อินเตอร์เทรด จำกัด (มหาชน)',
          recipient: 'CP INTERTRADE CO., LTD.',
          buyer: null,
          exportAgent: 'ธรรมรัตน์',
          exportAgentNoCut: 'นายธรรมรัตน์ สมใจ',
          companyTax: '0105555123456',
          telephone: '027667662',
          product: 'ข้าวเจ้าขาวอื่น',
          issueDate: '2026-01-01T00:00:00.000Z',
          expiredDate: '2026-12-31T00:00:00.000Z',
          exportDate: null,
          buyerCountry: 'HONG KONG',
          destinationCountry: 'HONG KONG',
          exportBy: null,
          vehicle: 'เรือ',
          portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
          currency: 'USD',
          exchangeRate: 33.5,
          permitConditions: '-',
          licenseDetails: [
            { licenseDetailID: '002e19b7-4aeb-4ec4-b93d-5b1a25d14f08', pricePerUnit: 450.5 },
          ],
        },
        data: [
          {
            licenseIndex: 1,
            licenseDetailID: '002e19b7-4aeb-4ec4-b93d-5b1a25d14f08',
            remainNetWeightKGM: 6000,
            maximumWeight: 44000,
            records: [
              {
                jobID: 50,
                quantity: 600,
                totalNetWeight: 38000,
                loadingDetails: 'Loading in container',
                riceName: 'ข้าวเจ้าขาวอื่น 100 %',
                vehicleName: 'lic',
                shippingDateTime: '2026-05-18T19:30:00.000Z',
                surveyProvince: 'กาญจนบุรี',
                surveyname: 'KARNPANICH RICE MILL',
                portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
                surveyPaidBy: 'ซี.พี.อินเตอร์เทรด จำกัด',
              },
            ],
          },
        ],
      },
    },
  })
  @ApiQuery({ name: 'licensenumber', required: true, type: String, description: 'License Number', example: '0308116917947' })
  @Get('licensehistory')
  getLicenseHistory(
    @Query('licensenumber') licenseNumber: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.getLicenseHistory(licenseNumber, request, response);
  }

  @ApiOperation({
    summary: 'Get Check Weight Data filter by jobno and licenseid',
  })
  @ApiResponse({
    status: 200,
    description: 'Get check weight data by Date successfully.',
  })
  @ApiQuery({
    name: 'jobno',
    required: true,
    type: String,
    description: 'Filter Date',
    example: '9999',
  })
  @ApiQuery({
    name: 'licenseid',
    required: true,
    type: String,
    description: 'Filter Date',
    example: '0308116838587',
  })
  @Get('getcheckweightdatafilterbyjobnoandlicenseid')
  getCheckWeightDatafilterjobNoandid(
    @Query('jobno') jobNo: number,
    @Query('licenseid') licenseId: string,
    @Req() request: any,

    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.recordnotificationService.getCheckWeightDataFilterjobNoandid(
      jobNo,
      licenseId,
      request,
      response,
    );
  }

  
}
