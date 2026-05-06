import { Body, Controller, Get, Param, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CertificateService } from './certificate.service';
import { UpdateCertificateDto } from 'src/dto/certificatesheet.dto';



@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

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
}