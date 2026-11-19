import { Body, Controller, Get, HttpCode, HttpStatus, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { certificatesheet } from '@prisma/client';
import { LicenseHistoryResponse } from 'src/common/license-history';
import { LICENSE_HISTORY_EXAMPLE } from 'src/common/license-history.swagger';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {
  CertificateDetailWithEnNames,
  CertificateExportResponse,
  CertificatesByDateResponse,
  CertificateService,
} from './certificate.service';

const UPDATE_CERTIFICATE_EXAMPLE = {
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
  status: true,
};

const CERTIFICATE_EXPORT_EXAMPLE = {
  result: [
    {
      'วันที่': '07/04/2569',
      'ผู้ได้รับอนุญาต': 'AEON TOPVALU (THAILAND) CO., LTD.',
      'ผู้ส่งมอบ': 'Bangkok Warehouse',
      'เลขที่ใบอนุญาต': '1690968',
      'คำสั่งจ่ายงานเลขที่': 17,
      'เรือใหญ่': 'Bangkok',
      'เมืองตราส่ง': 'UNITED STATES OF AMERICA',
      'ชนิดข้าว': 'WHITE RICE 15%',
      'ปริมาณ/เมตริกตัน': '1,000.00',
      'CER NO.': '00009',
      'PAPER NO': '00008',
      'PAPER NO ': '00020',
    },
  ],
  'รวมปริมาณตัน': '1,000.00',
};

@ApiTags('Certificate')
@ApiBearerAuth()
@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getcertificatebyid')
  @ApiOperation({ summary: 'Get certificate by ID (with English names resolved)' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Certificate retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Certificate not found.' })
  getCertificateById(@Query('id') id: string): Promise<CertificateDetailWithEnNames> {
    return this.certificateService.getCertificateById(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getcertificatebydate')
  @ApiOperation({ summary: 'Get certificates checked on a given day, plus latest cert/paper numbers' })
  @ApiQuery({ name: 'date', required: true, type: String, example: '2026-04-07' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully.' })
  getCertificatesByDate(@Query('date') date: string): Promise<CertificatesByDateResponse> {
    return this.certificateService.getCertificatesByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatecertificate')
  @ApiOperation({ summary: 'Update certificate (certNo / paperNoOriginal / paperNoCopy must be unique)' })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateCertificateDto, examples: { fullExample: { value: UPDATE_CERTIFICATE_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Certificate updated successfully.' })
  @ApiResponse({ status: 400, description: 'certNo / paperNoOriginal / paperNoCopy already exists.' })
  @ApiResponse({ status: 404, description: 'Certificate not found.' })
  updateCertificate(
    @Query('id') id: string,
    @Body() dto: UpdateCertificateDto,
  ): Promise<certificatesheet> {
    return this.certificateService.updateCertificate(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('search')
  @ApiOperation({ summary: 'Search certificates by certNo, jobID and/or licenseNumber (partial match)' })
  @ApiQuery({ name: 'certNo', required: false, type: Number })
  @ApiQuery({ name: 'jobID', required: false, type: Number })
  @ApiQuery({ name: 'licenseNumber', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Certificates found successfully.' })
  @ApiResponse({ status: 404, description: 'No data found.' })
  searchCertificates(
    @Query('certNo') certNo?: string,
    @Query('jobID') jobID?: string,
    @Query('licenseNumber') licenseNumber?: string,
  ) {
    return this.certificateService.searchCertificates({ certNo, jobID, licenseNumber });
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('certificatehistorybydate')
  @ApiOperation({ summary: 'Export certificates in a date range (Thai column headers)' })
  @ApiQuery({ name: 'startdate', required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'enddate', required: true, example: '2026-04-30' })
  @ApiResponse({ status: 200, description: 'Certificates exported.', schema: { example: CERTIFICATE_EXPORT_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'Data Not found.' })
  exportCertificatesByDateRange(
    @Query('startdate') startDate: string,
    @Query('enddate') endDate: string,
  ): Promise<CertificateExportResponse> {
    return this.certificateService.exportCertificatesByDateRange(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('certificatehistorybymonth')
  @ApiOperation({ summary: 'Export certificates of a month (Thai column headers)' })
  @ApiQuery({ name: 'month', required: true, example: '04' })
  @ApiQuery({ name: 'year', required: true, example: '2026' })
  @ApiResponse({ status: 200, description: 'Certificates exported.', schema: { example: CERTIFICATE_EXPORT_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Invalid month or year.' })
  @ApiResponse({ status: 404, description: 'Data Notfound.' })
  exportCertificatesByMonth(
    @Query('month') month: string,
    @Query('year') year: string,
  ): Promise<CertificateExportResponse> {
    return this.certificateService.exportCertificatesByMonth(month, year);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('certificatehistory')
  @ApiOperation({ summary: 'Get certified usage history of a license, grouped by license detail' })
  @ApiQuery({ name: 'licensenumber', required: true, example: '0308116917947' })
  @ApiResponse({ status: 200, description: 'License history retrieved successfully.', schema: { example: LICENSE_HISTORY_EXAMPLE } })
  getCertificateHistory(@Query('licensenumber') licenseNumber: string): Promise<LicenseHistoryResponse> {
    return this.certificateService.getCertificateHistory(licenseNumber);
  }
}
