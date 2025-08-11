import { Body, Controller, Get, Post, Put, Query, Req, Res } from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { UpdateCheckWeightData, ValidateCheckWeightDto } from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
import { FastifyReply } from 'fastify';
@Controller('recordnotification')
export class RecordnotificationController {
  constructor(private readonly recordnotificationService: RecordnotificationService) {}

    @Post('postdata')
    postdata( @Body() dto: ValidateCheckWeightDto[],
        @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
      return this.recordnotificationService.postData(dto,request, response);
    }
    @Get('getcheckweightdata')
    getCheckWeightData( @Query('checkWeightID') checkWeightID: string, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
        return this.recordnotificationService.getCheckWeightData(checkWeightID,request, response);
    } 
     @Get('getcheckweightdatafilterbydate')
    getCheckWeightDatafilterDate( @Query('date') date: string, @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {
        return this.recordnotificationService.getCheckWeightDataFilterDate(date,request, response);
    } 
    @Put('updatecheckweightdata')
    updatecheckweightdata( @Query('checkWeightID') checkWeightID: string, @Body() dto: UpdateCheckWeightData,
      @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
) {    
      return this.recordnotificationService.updateCheckWeightData(checkWeightID,dto, request, response);
      }
}
