import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { FastifyReply } from 'fastify';
import { request } from 'http';
import { CreateSurveyDto } from 'src/dto/user.dto';
import { CreateOrderDto } from 'src/dto/request.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}
    @ApiOperation({ summary: 'Get Data from Goverment' })
    
    @ApiResponse({ status: 200, description: 'Get Data from Goverment Complete' })
  @Post('getdata')
  getdata(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
    return this.tradeService.getData(request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get License Query ดึงข้อมูลใบอนุญาต ' })
 
  @ApiResponse({ status: 200, description: 'Query License Data Complete' })
  @Get('licensequery')
  licensequery(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {
    const licenseNo = request.query.licenseNo;

    return this.tradeService.licensequery(licenseNo, request,response);
  }
 @ApiOperation({ summary: 'ดึงข้อมูลสถานที่ตรวจสอบ' })
 
  @ApiResponse({ status: 200, description: 'Query สถานที่ตรวจสอบ Complete' })
  @UseGuards(JwtAuthGuard)
  @Get('inspectplace')
  getInspectPlace(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {
    return this.tradeService.getInspectPlace(request, response);
  }

   @ApiOperation({ summary: 'ดึงข้อมูลจังหวัด' })
  @ApiResponse({ status: 200, description: 'Query ข้อมูล' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('province')
  province(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,){
return {
  "provinces": [
    "กรุงเทพมหานคร",
    "กระบี่",
    "กาญจนบุรี",
    "กาฬสินธุ์",
    "กำแพงเพชร",
    "ขอนแก่น",
    "จันทบุรี",
    "ฉะเชิงเทรา",
    "ชลบุรี",
    "ชัยนาท",
    "ชัยภูมิ",
    "ชุมพร",
    "เชียงราย",
    "เชียงใหม่",
    "ตรัง",
    "ตราด",
    "ตาก",
    "นครนายก",
    "นครปฐม",
    "นครพนม",
    "นครราชสีมา",
    "นครศรีธรรมราช",
    "นครสวรรค์",
    "นนทบุรี",
    "นราธิวาส",
    "น่าน",
    "บึงกาฬ",
    "บุรีรัมย์",
    "ปทุมธานี",
    "ประจวบคีรีขันธ์",
    "ปราจีนบุรี",
    "ปัตตานี",
    "พระนครศรีอยุธยา",
    "พะเยา",
    "พังงา",
    "พัทลุง",
    "พิจิตร",
    "พิษณุโลก",
    "เพชรบุรี",
    "เพชรบูรณ์",
    "แพร่",
    "ภูเก็ต",
    "มหาสารคาม",
    "มุกดาหาร",
    "แม่ฮ่องสอน",
    "ยโสธร",
    "ยะลา",
    "ร้อยเอ็ด",
    "ระนอง",
    "ระยอง",
    "ราชบุรี",
    "ลพบุรี",
    "ลำปาง",
    "ลำพูน",
    "เลย",
    "ศรีสะเกษ",
    "สกลนคร",
    "สงขลา",
    "สตูล",
    "สมุทรปราการ",
    "สมุทรสงคราม",
    "สมุทรสาคร",
    "สระแก้ว",
    "สระบุรี",
    "สิงห์บุรี",
    "สุโขทัย",
    "สุพรรณบุรี",
    "สุราษฎร์ธานี",
    "สุรินทร์",
    "หนองคาย",
    "หนองบัวลำภู",
    "อ่างทอง",
    "อำนาจเจริญ",
    "อุดรธานี",
    "อุตรดิตถ์",
    "อุทัยธานี",
    "อุบลราชธานี"
  ]
}

  }

@ApiOperation({ summary: 'แจ้งขอตรวจสอบ' })
@ApiResponse({ status: 200, description: 'ทำการแจ้งขอตรวจสอบ Complete' })
@ApiBody({
  description: 'รายละเอียดการแจ้งขอตรวจสอบ',
  schema: {
    example: {
      "companyName": "ซี.พี.อินเตอร์เทรด จำกัด",
      "payer": "ซี.พี.อินเตอร์เทรด จำกัด",
      "requestBy": "ธรรมรัตน์",
      "requestDate": "2026-05-19T17:34:37.904+07:00",
      "shippingDateTime": "2026-05-19T02:30:00.000+07:00",
      "surveyLocateNameThai": "การพานิช",
      "surveyLocateNameEng": "KARNPANICH RICE MILL",
      "surveyPaidBy": "",
      "surveyProvince": "กาญจนบุรี",
      "surveySubDistrict": "ท่าม่วง",
      "telInspector": "027667662",
      "telDebtor": "",
      "licenseNumber": "0308116917947",
      "description": [
          {
              "licenseDetailID": "002e19b7-4aeb-4ec4-b93d-5b1a25d14f08",
              "index": 1,
              "destination": "HONG KONG",
              "riceType": "ข้าวเจ้าขาวอื่น 100 %",
              "vehicleName": "lic",
              "marker": "",
              "licenseNumber": "0308116920068",
              "quantity": 1760,
              "quantityUnit": "BG",
              "grossWeight": 200,
              "netWeightW": 25,
              "netWeightTON": 44,
              "netWeightKGM": 40000
          }
      ]
    }
  }
})
@UseGuards(JwtAuthGuard)
@HttpCode(200)
@Post('createrequest')
  createOrder(
    @Body() dto: CreateOrderDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.tradeService.createOrder(dto, response);
  }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'ทำการลบข้อมูลการแจ้งขอตรวจสอบ' })
  @ApiResponse({ status: 200, description: 'ทำการลบ ข้อมูลการแจ้งขอตรวจสอบ Complete' })
    @ApiQuery({ name: 'id', required: true, type: String, description: 'id' })
  @HttpCode(200)
  @Delete('deleteorder')
  deleteOrder(
  @Query('id') orderID: string,@Req() request: any,
  @Res({ passthrough: true }) response: FastifyReply,) {

    return this.tradeService.deleteOrder(orderID, request, response);
  }
  @HttpCode(200)
   @ApiOperation({ summary: 'ทำการลบ รายละเอียดย่อยข้างล่าง Complete' })
  @ApiResponse({ status: 200, description: 'ทำการลบ รายละเอียดย่อยข้างล่าง Complete' })
    @ApiQuery({ name: 'id', required: true, type: String, description: 'id' })
  @Delete('deletedescription')
  deleteOrdeDetail(
       @Query('id') descriptionID: string,@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {

    return this.tradeService.deleteOrderDetail(descriptionID, request, response);
  }

 @ApiOperation({ summary: 'Update แจ้งขอตรวจสอบ' })
  @ApiResponse({ status: 200, description: 'ทำการUpdate แจ้งขอตรวจสอบ Complete' })
    
@UseGuards(JwtAuthGuard)
@HttpCode(200)
@Put('updaterequest')
updateOrder(
  @Query('id') id: string,
  @Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.updateOrder(id.trim(), request.body, request, response);
}

 @ApiOperation({ summary: 'ดึงข้อมูลแจ้งขอตรวจสอบ' })
  @ApiResponse({ status: 200, description: 'ทำการดึงข้อมูล แจ้งขอตรวจสอบ Complete' })
    @ApiQuery({ name: 'id', required: true, type: String, description: 'id' })
  @UseGuards(JwtAuthGuard)
 @HttpCode(200)
@Get('getrequest')
getRequest(
  @Query('id') id: string,
 @Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.getRequest(id, request, response);  
}

  @UseGuards(JwtAuthGuard)
 @HttpCode(200)
  @ApiOperation({ summary: 'ดึงข้อมูลแจ้งขอตรวจสอบโดยวันที่' })
  @ApiResponse({ status: 200, description: 'ทำการดึงข้อมูลแจ้งขอตรวจสอบโดยวันที่ Complete' })
    @ApiQuery({ name: 'date', required: true, type: Date, description: 'Filter Date' })
@Get('getrequestbydate')
getRequestbydate(
  @Query('date') date: string,
  
  @Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.getRequestbydate(date, request, response);  
}

// @UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'ทำการPost ข้อมูล SurveyName' })
  @ApiBody({ type: [CreateSurveyDto] })
  @ApiResponse({ status: 200, description: 'ทำการPost ข้อมูล SurveyName Complete' })
@Post('postsurvey')
async postSurvey(
  @Body() dto: CreateSurveyDto[],
  @Req() request: any,
  @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.postSurvey(dto, request, response);  
}
@ApiOperation({ summary: 'ทำการGet ข้อมูล ใบอนุญาติ' })
  @ApiBody({ type: [CreateSurveyDto] })
  @ApiResponse({ status: 200, description: 'ทำการPost ข้อมูล SurveyName Complete' })
@Get('getlicensebydate')
async getlicensebyDate(
  @Query('startdate') startdate: string,
  @Query('enddate') enddate: string,
  @Req() request: any,
  @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.getlicensebyDate(startdate,enddate, request, response);  
}
}





