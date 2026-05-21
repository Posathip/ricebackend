import { Body, Controller, Get, HttpCode, Param, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CertificateService } from './certificate.service';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';
import { JwtAuthGuard,  } from 'src/guards/jwt.guard';


@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}
@UseGuards(JwtAuthGuard)
  @HttpCode(200)
@Get('getcertificatebyid')
 @ApiOperation({ summary: 'Get Certificate by ID' })
@ApiResponse({
      status: 200,
      description: 'Get certificate by ID successfully.', 
    })
    getCertificateById(
      @Query('id') id: string,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply,
    ) {
      return this.certificateService.getcertificatebyid(id, request, response);
    }

    @Get('getcertificatebydate')
    @ApiOperation({ summary: 'Get All Certificates by Date' })
    @ApiResponse({
      status: 200,
      description: 'Get all certificates by date successfully.',
    })
  @ApiOperation({ summary: 'Get All Certificate Weight Data' })
    @ApiResponse({
      status: 200,
      description: 'Get all certificate weight data successfully.',
    })
@Get('getcertificatebydate')
    getAllCheckWeightData(
      @Req() request: any,
      @Query('date') date: string,
      @Res({ passthrough: true }) response: FastifyReply,
    ) {
      return this.certificateService.getAllCertificatebyDate(date,
        request,
        response,
      );
    }

  // update-certificate.dto.ts
  @Put('updatecertificate')
  @ApiOperation({ summary: 'Update Certificate' })
  @ApiBody({
  type: UpdateCertificateDto,
  examples: {
    fullExample: {
      value: {
        certNo: 'CERT-001',
        paperNoOriginal: 'PO-ORIG-123',
        paperNoCopy: 'PO-COPY-123',
        licenseNumber: 'LN-998877',
        jobID: 10,
        license: 'LIC-2026',
        index: 1,
        specialJob: 'Special export case',
        No: 5,
        title: 'Certificate Title',
        companyName: 'ABC Co., Ltd.',
        surveyLocateNameThai: 'คลังสินค้า A',
        portName: 'Bangkok Port',
        destination: 'Japan',
        netWeightTON: 25.5,
        riceType: 'Jasmine Rice',
        note: 'Handle with care',
        dateCertificate: '2026-04-21',
        quantity: 1000,
        unit: 'bags',
        descriptionOfGoodsLine1: 'Premium Thai Rice',
        descriptionOfGoodsLine2: 'Grade A',
        descriptionOfGoodsLine3: 'Export Quality',
        packing: '50kg per bag',
        unitKGS_Nett: 50000,
        marks: 'MARK123',
        shipper: 'XYZ Exporter',
        goDown: 'Warehouse B',
        dateOfLoading: '2026-04-20',
        dateCheckWeight: '2026-04-19',
        shippingPort: 'Laem Chabang Port',
        carryingVessel: 'Vessel A123',
        qualityLine1: 'Moisture < 14%',
        qualityLine2: 'Broken < 5%',
        weight: '50000 KGS',
        totalGrossWeight: 52000,
        totalTareWeight: 2000,
        totalNettWeight: 50000,
        status: true
      },
    },
  },
})
@ApiBody({
  type: UpdateCertificateDto,
  examples: {
    fullExample: {
      value: {
        certNo: 1,
        paperNoOriginal: 3,
        paperNoCopy: 2,
        licenseNumber: '13 หลัก',
        jobID: 10,
        index: 1,
        specialJob: 'Special export case',
        No: 5,
        title: 'Certificate Title',
        companyName: 'ABC Co., Ltd.',
        surveyLocateNameThai: 'คลังสินค้า A',
        portName: 'Bangkok Port',
        destination: 'Japan',
        netWeightTON: 25.5,
        riceType: 'Jasmine Rice',
        note: 'Handle with care',
        dateCertificate: '2026-04-21',
        quantity: 1000,
        unit: 'bags',
        descriptionOfGoodsLine1: 'Premium Thai Rice',
        descriptionOfGoodsLine2: 'Grade A',
        descriptionOfGoodsLine3: 'Export Quality',
        packing: '50kg per bag',
        unitKGS_Nett: 50000,
        marks: 'MARK123',
        shipper: 'XYZ Exporter',
        goDown: 'Warehouse B',
        dateOfLoading: '2026-04-20',
        dateCheckWeight: '2026-04-19',
        shippingPort: 'Laem Chabang Port',
        carryingVessel: 'Vessel A123',
        qualityLine1: 'Moisture < 14%',
        qualityLine2: 'Broken < 5%',
        weight: '50000 KGS',
        totalGrossWeight: 52000,
        totalTareWeight: 2000,
        totalNettWeight: 50000,
        status: true
      },
    },
  },
})

  @ApiResponse({
    status: 200,
    description: 'Certificate updated successfully.',
  })
  updateCertificate(
    @Query('id') id: string,
          @Req() request: any,
    @Body() updateCertificateDto: UpdateCertificateDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.certificateService.updateCertificate(id, updateCertificateDto,  request,
        response);
  }
  
  

@Get('search')
@ApiOperation({ summary: 'Search Certificates by Multiple Fields' })
@ApiResponse({
  status: 200,
  description: 'Certificates found successfully.',
})
searchCertificates(
  @Req() request: any,
  @Res({ passthrough: true }) response: FastifyReply,
  @Query('certNo') certNo?: number,
  @Query('jobID') jobID?: string,
  @Query('licenseNumber') licenseNumber?: string,
 

) {
  return this.certificateService.searchCertificates(
    { certNo, jobID, licenseNumber },
    request,
    response,
  );
}
@UseGuards(JwtAuthGuard)
@HttpCode(200)

@Get('certificatehistorybydate')
@ApiOperation({ summary: 'Filter All Certificates by Date Range' })
@ApiResponse({
  status: 200,
  description: 'Certificates filtered by month successfully.',
  schema: {
    type: 'array',
    example: [
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'ตงฮั้ว ไร้ซ์ จำกัด',
        ผู้ส่งมอบ: 'Bangkok Warehouse',
        เลขที่ใบอนุญาต: 'LIC-998877',
        คำสั่งจ่ายงานเลขที่: 12345,
        เรือใหญ่: 'Bangkok',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'ข้าวกล้องเจ้าสีแดง ชั้นดีพิเศษ',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 1,
        'PAPER NO': 1,
        'PAPER NO ': 1,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'เคเจ เวิลด์ฟู้ดส์ จำกัด',
        ผู้ส่งมอบ: '',
        เลขที่ใบอนุญาต: '0308116909682',
        คำสั่งจ่ายงานเลขที่: 17,
        เรือใหญ่: '',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'ข้าวเจ้าขาวหอมไทย 100%',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 3,
        'PAPER NO': 3,
        'PAPER NO ': 3,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'ตงฮั้ว ไร้ซ์ จำกัด',
        ผู้ส่งมอบ: '',
        เลขที่ใบอนุญาต: '0308116910484',
        คำสั่งจ่ายงานเลขที่: 19,
        เรือใหญ่: '',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว:
          'ข้าวกล้องเจ้าสีดำ สีม่วงดำ และสีม่วง ชั้นดีพิเศษ',
        'ปริมาณ/เมตริกตัน': 108,
        'CER NO.': 4,
        'PAPER NO': 4,
        'PAPER NO ': 4,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'AEON TOPVALU (THAILAND) CO., LTD.',
        ผู้ส่งมอบ: 'Bangkok Warehouse',
        เลขที่ใบอนุญาต: 'LIC-998877',
        คำสั่งจ่ายงานเลขที่: 12345,
        เรือใหญ่: 'Bangkok',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'WHITE RICE 15%',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 9,
        'PAPER NO': 8,
        'PAPER NO ': 20,
      },
    ],
  },
})
@ApiQuery({ name: 'startdate', required: true, example: '2026-04-01' })
@ApiQuery({ name: 'enddate', required: true, example: '2026-04-30' })
getcertificatehistorybydate(
  @Req() request: any,
  @Query('startdate') startdate: string,
  @Query('enddate') enddate: string,
  @Res({ passthrough: true }) response: FastifyReply,
) {
  return this.certificateService.filterAllCertificatebyDate(startdate, enddate, request, response);
}

@Get('certificatehistorybymonth')  
@ApiOperation({ summary: 'Filter All Certificates by Month' })
@ApiResponse({
  status: 200,
  description: 'Certificates filtered by month successfully.',
  schema: {
    type: 'array',
    example: [
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'ตงฮั้ว ไร้ซ์ จำกัด',
        ผู้ส่งมอบ: 'Bangkok Warehouse',
        เลขที่ใบอนุญาต: 'LIC-998877',
        คำสั่งจ่ายงานเลขที่: 12345,
        เรือใหญ่: 'Bangkok',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'ข้าวกล้องเจ้าสีแดง ชั้นดีพิเศษ',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 1,
        'PAPER NO': 1,
        'PAPER NO ': 1,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'เคเจ เวิลด์ฟู้ดส์ จำกัด',
        ผู้ส่งมอบ: '',
        เลขที่ใบอนุญาต: '0308116909682',
        คำสั่งจ่ายงานเลขที่: 17,
        เรือใหญ่: '',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'ข้าวเจ้าขาวหอมไทย 100%',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 3,
        'PAPER NO': 3,
        'PAPER NO ': 3,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'ตงฮั้ว ไร้ซ์ จำกัด',
        ผู้ส่งมอบ: '',
        เลขที่ใบอนุญาต: '0308116910484',
        คำสั่งจ่ายงานเลขที่: 19,
        เรือใหญ่: '',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว:
          'ข้าวกล้องเจ้าสีดำ สีม่วงดำ และสีม่วง ชั้นดีพิเศษ',
        'ปริมาณ/เมตริกตัน': 108,
        'CER NO.': 4,
        'PAPER NO': 4,
        'PAPER NO ': 4,
      },
      {
        วันที่: '07/04/2569',
        ผู้ได้รับอนุญาต: 'AEON TOPVALU (THAILAND) CO., LTD.',
        ผู้ส่งมอบ: 'Bangkok Warehouse',
        เลขที่ใบอนุญาต: 'LIC-998877',
        คำสั่งจ่ายงานเลขที่: 12345,
        เรือใหญ่: 'Bangkok',
        เมืองตราส่ง: 'UNITED STATES OF AMERICA',
        ชนิดข้าว: 'WHITE RICE 15%',
        'ปริมาณ/เมตริกตัน': 1000,
        'CER NO.': 9,
        'PAPER NO': 8,
        'PAPER NO ': 20,
      },
    ],
  },
})

@ApiQuery({ name: 'month', required: true, example: '04' })
@ApiQuery({ name: 'year', required: true, example: '2026' })
getcertificatehistorybymonth(
  @Req() request: any,
  @Query('month') month: string,
  @Query('year') year: string,
  @Res({ passthrough: true }) response: FastifyReply,
) {
  const startdate = `${year}-${month}-01`;
  const enddate = `${year}-${month}-31`;
  console.log('Start Date:', startdate);
  console.log('End Date:', enddate);
  return this.certificateService.filterAllCertificatebyMonth(startdate, enddate, request, response);

}

@Get('certificatehistory') 
@ApiOperation({ summary: 'Get Certificate History by licenseNumber' })
@ApiResponse({
  status: 200,
  description: 'Get certificate history by licenseNumber successfully.',
})
@ApiQuery({ name: 'licensenumber', required: true, example: '01342424294299' })
gethistoryCertificate(
  @Req() request: any,
  @Query('licensenumber') licenseNumber: string,
   @Res({ passthrough: true }) response: FastifyReply,
){
  return this.certificateService.gethistoryCertificate(licenseNumber, request, response);
}
}