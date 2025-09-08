import { Body, Controller, Get, Post, Put, Query, Req, Res } from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { UpdateCheckWeightData, ValidateCheckWeightDto } from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
import { FastifyReply } from 'fastify';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
@Controller('recordnotification')
export class RecordnotificationController {
  constructor(private readonly recordnotificationService: RecordnotificationService) {}
  @ApiOperation({ summary: 'Post Check Weight Data' })
  @ApiBody({ type: [ValidateCheckWeightDto] })
  @ApiResponse({ status: 200, description: 'Post Data Check Weight Complete.' })
  @Post('postdata')
    postdata( @Body() dto: ValidateCheckWeightDto[],
        @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
      return this.recordnotificationService.postData(dto,request, response);
    }
    @ApiOperation({ summary: 'Get All Check Weight Data' })
    @ApiResponse({ status: 200, description: 'Get all check weight data successfully.' })
    @Get('getallcheckweightdata')
    getAllCheckWeightData(
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply,
    ) {
      return this.recordnotificationService.getAllCheckWeightData(request, response);
    }

    @ApiOperation({ summary: 'Get Check Weight Data by ID' })
    @ApiResponse({ status: 200, description: 'Get check weight data by ID successfully.' })
    @ApiQuery({ name: 'checkWeightID', required: true, type: String, description: 'ID of the check weight record',example:'12323214214' })
    @Get('getcheckweightdata')
    getCheckWeightData( @Query('checkWeightID') checkWeightID: string, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
)   {
        return this.recordnotificationService.getCheckWeightData(checkWeightID,request, response);
    } 

    @ApiOperation({ summary: 'Get Check Weight Data by ID FilterBydate' })
    @ApiResponse({ status: 200, description: 'Get check weight data by Date successfully.' })
    @ApiQuery({ name: 'date', required: true, type: Date, description: 'Filter Date' })
    @Get('getcheckweightdatafilterbydate')
    getCheckWeightDatafilterDate( @Query('date') date: string, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
        return this.recordnotificationService.getCheckWeightDataFilterDate(date,request, response);
    } 
     @ApiOperation({ summary: 'Update Check Weight Data' })
    @ApiResponse({ status: 200, description: 'Update check weight data by Date successfully.' })
    @ApiBody({ type: UpdateCheckWeightData })
    @ApiQuery({ name: 'checkweightid', required: true, type: String, description: 'Filter Date' })
    @Put('updatecheckweightdata')
    updatecheckweightdata( @Query('checkweightid') checkWeightID: string, @Body() dto: UpdateCheckWeightData,
      @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {    
      return this.recordnotificationService.updateCheckWeightData(checkWeightID,dto, request, response);
      }

      @ApiOperation({ summary: 'Get Check Weight Data filter by jobno and licenseid' })
    @ApiResponse({ status: 200, description: 'Get check weight data by Date successfully.' })
    @ApiQuery({ name: 'jobno', required: true, type: String, description: 'Filter Date' ,example:"9999" }
    
    )
    @ApiQuery({ name: 'licenseid', required: true, type: String, description: 'Filter Date' ,example:"0308116838587" }
    
    )
    @Get('getcheckweightdatafilterbyjobnoandlicenseid')
    getCheckWeightDatafilterjobNoandid( @Query('jobno') jobNo: number, 
    @Query('licenseid') licenseId: string,@Req() request: any,
    
    @Res({ passthrough: true }) response: FastifyReply,
) {
        return this.recordnotificationService.getCheckWeightDataFilterjobNoandid(jobNo,licenseId,request, response);
    } 
}
