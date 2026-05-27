import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Check Weight Data by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get check weight data by ID successfully.',
    schema: {
      example: {
        message: 'Check weight data retrieved successfully',
        data: {
          checkWeightID: '2ff49ff2-b0f8-4d1e-9d27-7cbb8adf5be7',
          jobID: 86,
          staffID: '3f15ef10-3561-4693-b2f3-441825aada30',
          staffName: null,
          status: true,
          supplierName: 'เฮ็ลตี้ไรซ จำกัด',
          time: '2026-05-21T19:30:00.000Z',
          noOfBags: 2350,
          grossWeight: 3,
          netWeightW: 2,
          netWeightTon: 21.3145,
          totalGrossWeight: 7050,
          totalNetWeight: 4700,
          totalTareWeight: 4700,
          remainWeight: null,
          weightPerTon: 0,
          goDown: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
          loadingDetails: '-',
          specialJob: null,
          statusContinue: '-',
          note: '-',
          vehicleName: 'cc',
          riceName: 'ข้าวขาวหอมไทย 100%',
          quantity: 2350,
          descriptionID: 'e991b31e-2b83-4eac-a33b-346c6b8101fd',
          requestID: '1b0bcc6c-15f8-4d73-9230-43a6d3dfa9a8',
          description: {
            destination: 'UNITED STATES OF AMERICA',
            licenseDetailID: '8c545be6-e4ac-413d-8eb1-71657184d00c',
          },
          request: {
            licenseNumber: '0308116919489',
            shippingDateTime: '2026-05-14T19:30:00.000Z',
            requestBy: 'ธกร',
          },
          remainNetWeightKGM: 16614.5,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No data found for the given check weight ID.' })
  @ApiQuery({
    name: 'checkWeightID',
    required: true,
    type: String,
    description: 'ID of the check weight record',
    example: '2ff49ff2-b0f8-4d1e-9d27-7cbb8adf5be7',
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

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get License History by License Number' })
  @ApiResponse({
    status: 200,
    description: 'Get license history successfully.',
    schema: {
      example: {
        message: 'License history retrieved successfully',
        govData: {
          licenseNumber: '0308116920068',
          exporter: 'ซี.พี.อินเตอร์เทรด จำกัด',
          expiredDate: '2026-06-18T00:00:00.000Z',
          currency: 'USD',
          exchangeRate: 31.8975,
          destinationCountry: 'HONG KONG',
          licenseDetails: [
            {
              licenseDetailID: '61a703b1-30f4-4eaa-90a3-cbdc23292dda',
              permitId: '46002d65-2a6c-4149-8f94-579ee8068f8d',
              licenseNumber: '0308116920068',
              netWeightW: 25,
              tariffType: '1006.30.99-010',
              netWeightTON: 44,
              netWeightUnit: 'ตัน',
              netWeightKGM: 44000,
              netWeightUnitKGM: 'KGM',
              quantity: 1760,
              quantityUnit: 'BG',
              pricePerUnit: 632.18,
              currencyPerTON: 'USD/ตัน',
              fob: 887258.31,
              price: 887258.31,
              incoterms: 'FOB',
              productDescription: 'ข้าวเจ้าขาวอื่น 100 %',
              productDescriptionNotCut: 'ข้าวเจ้าขาวอื่น 100 % ชั้น 2บรรจุกระสอบโพลีโพรพีลีนลามิเนตในพลาสติก หนักกระสอบละ 25.00 กก. จำนวน 1760 กระสอบ',
              createdAt: '2026-05-19T16:20:03.597Z',
              updatedAt: '2026-05-19T09:19:59.673Z',
            },
          ],
        },
        data: [
          {
            licenseIndex: 1,
            licenseDetailID: '61a703b1-30f4-4eaa-90a3-cbdc23292dda',
            remainNetWeightKGM: 0,
            maximumWeight: 38000,
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
                surveyName: 'KARNPANICH RICE MILL',
                portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
                surveyPaidBy: '',
                requestBy: '',
              },
            ],
          },
          {
            licenseIndex: 2,
            licenseDetailID: '002e19b7-4aeb-4ec4-b93d-5b1a25d14f08',
            remainNetWeightKGM: 10000,
            maximumWeight: 40000,
            records: [
              {
                jobID: 63,
                quantity: 400,
                totalNetWeight: 10000,
                loadingDetails: 'A longside',
                riceName: 'ข้าวเจ้าขาวอื่น 100 %',
                vehicleName: 'lic',
                shippingDateTime: '2026-05-18T19:30:00.000Z',
                surveyProvince: 'กาญจนบุรี',
                surveyName: 'KARNPANICH RICE MILL',
                portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
                surveyPaidBy: '',
                requestBy: '',
              },
              {
                jobID: 64,
                quantity: 400,
                totalNetWeight: 10000,
                loadingDetails: 'A longside',
                riceName: 'ข้าวเจ้าขาวอื่น 100 %',
                vehicleName: 'lic',
                shippingDateTime: '2026-05-18T19:30:00.000Z',
                surveyProvince: 'กาญจนบุรี',
                surveyName: 'KARNPANICH RICE MILL',
                portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
                surveyPaidBy: '',
                requestBy: '',
              },
              {
                jobID: 68,
                quantity: 1000,
                totalNetWeight: 10000,
                loadingDetails: '-',
                riceName: 'ข้าวเจ้าขาวอื่น 100 %',
                vehicleName: 'lic',
                shippingDateTime: '2026-05-18T19:30:00.000Z',
                surveyProvince: 'กาญจนบุรี',
                surveyName: 'KARNPANICH RICE MILL',
                portName: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
                surveyPaidBy: '',
                requestBy: '',
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

  @UseGuards(JwtAuthGuard)
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
