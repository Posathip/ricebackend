import { Body, Controller, Get, Post, Put, Query, Req, Res } from '@nestjs/common';
import { RecordnotificationService } from './recordnotification.service';
import { UpdateCheckWeightData, ValidateCheckWeightDto } from 'src/dto/recordNoti.dto';
import express, { Request, Response } from 'express';
@Controller('recordnotification')
export class RecordnotificationController {
  constructor(private readonly recordnotificationService: RecordnotificationService) {}

    @Post('postdata')
    postdata( @Body() dto: ValidateCheckWeightDto[],
       @Req() req: Request,
      @Res({ passthrough: true }) res: Response,) {
      return this.recordnotificationService.postData(dto,req, res);
    }
    @Get('getcheckweightdata')
    getCheckWeightData( @Query('checkWeightID') checkWeightID: string,@Req() req: Request, @Res() res: Response) {
        return this.recordnotificationService.getCheckWeightData(checkWeightID,req, res);
    } 
    @Put('updatecheckweightdata')
    updatecheckweightdata( @Query('checkWeightID') checkWeightID: string, @Body() dto: UpdateCheckWeightData,
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response) {    
      return this.recordnotificationService.updateCheckWeightData(checkWeightID,dto, req, res);
      }
}
