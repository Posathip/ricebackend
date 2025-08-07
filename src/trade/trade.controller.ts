import { Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { FastifyReply } from 'fastify';
import { request } from 'http';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('getdata')
  getdata(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
    return this.tradeService.getData(request, response);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('licensequery')
  licensequery(@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {
    const licenseNo = request.query.licenseNo;

    return this.tradeService.licensequery(licenseNo, request,response);
  }
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

 @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('createorder')
  createOrder(@Req() req: any,
       @Res({ passthrough: true }) response: FastifyReply,) {
     return this.tradeService.createOrder(req.body, req, response);
  }

    @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete('deleteorder')
  deleteOrder(
       @Query('id') orderID: string,@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {

    return this.tradeService.deleteOrder(orderID, request, response);
  }
  @HttpCode(200)
  @Delete('deletedescription')
  deleteOrdeDetail(
       @Query('id') descriptionID: string,@Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,) {

    return this.tradeService.deleteOrderDetail(descriptionID, request, response);
  }

@UseGuards(JwtAuthGuard)
@HttpCode(200)
@Put('updateorder')
updateOrder(
  @Query('id') id: string,
  @Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.updateOrder(id.trim(), request.body, request, response);
}

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
@Get('getrequestbydate')
getRequestbydate(
  @Query('date') date: string,
  
  @Req() request: any,
       @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.tradeService.getRequestbydate(date, request, response);  
}

}


