import { Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('getdata')
  getdata(@Req() req: Request, @Res() res: Response) {
    return this.tradeService.getData(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('licensequery')
  licensequery(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const licenseNo = req.query.licenseNo;

    return this.tradeService.licensequery(licenseNo, req,res);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('province')
  province(@Req() req: Request, @Res({ passthrough: true }) res: Response){
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
  createOrder(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
     return this.tradeService.createOrder(req.body, req, res);
  }

    @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete('deleteorder')
  deleteOrder(
       @Query('id') orderID: string,@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    return this.tradeService.deleteOrder(orderID, req, res);
  }
  @HttpCode(200)
  @Delete('deletedescription')
  deleteOrdeDetail(
       @Query('id') descriptionID: string,@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    return this.tradeService.deleteOrderDetail(descriptionID, req, res);
  }

@UseGuards(JwtAuthGuard)
@HttpCode(200)
@Put('updateorder')
updateOrder(
  @Query('id') id: string,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  return this.tradeService.updateOrder(id.trim(), req.body, req, res);
}

  @UseGuards(JwtAuthGuard)
 @HttpCode(200)
@Get('getrequest')
getRequest(
  @Query('id') id: string,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  return this.tradeService.getRequest(id, req, res);  
}

  @UseGuards(JwtAuthGuard)
 @HttpCode(200)
@Get('getrequestbydate')
getRequestbydate(
  @Query('date') date: string,
  
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  return this.tradeService.getRequestbydate(date, req, res);  
}

}


