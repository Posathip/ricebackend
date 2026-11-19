import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { entireCertificate } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {
  CreateEntireCertificateDto,
  UpdateEntireCertificateDto,
} from 'src/dto/entirecertificate.dto';
import { DataWrapper, EntirecertificateService } from './entirecertificate.service';

const TYPE_QUERY_DESCRIPTION =
  'ระบุประเภท เช่น "Form A" — ถ้าต้องการข้อมูลทุกประเภท ไม่ต้องส่ง parameter นี้มา หรือส่ง "All"';

@ApiTags('EntireCertificate')
@ApiBearerAuth()
@Controller('entirecertificate')
export class EntirecertificateController {
  constructor(private readonly entirecertificateService: EntirecertificateService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getdata')
  @ApiOperation({ summary: 'Get all entire certificates' })
  @ApiResponse({ status: 200, description: 'Returns all entire certificate records.' })
  getAll(): Promise<DataWrapper<entireCertificate[]>> {
    return this.entirecertificateService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getbyid')
  @ApiOperation({ summary: 'Get entire certificate by ID' })
  @ApiQuery({ name: 'id', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Returns the entire certificate record.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  getById(@Query('id') id: string): Promise<DataWrapper<entireCertificate>> {
    return this.entirecertificateService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('postdata')
  @ApiOperation({ summary: 'Create a new entire certificate' })
  @ApiBody({
    type: CreateEntireCertificateDto,
    examples: {
      example1: {
        value: {
          orderbillNo: 1001,
          certificateType: 'Form A',
          shipper: 'ABC Co., Ltd.',
          destination: 'Japan',
          invoice: 'INV-2026-001',
          note: 'Handle with care',
          shipping: 'Laem Chabang Port',
          statusAccounting: false,
          date: '2026-05-11T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'EntireCertificate created successfully.' })
  @ApiResponse({ status: 400, description: 'shipping is required.' })
  create(@Body() dto: CreateEntireCertificateDto): Promise<DataWrapper<entireCertificate>> {
    return this.entirecertificateService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatedata')
  @ApiOperation({ summary: 'Update an entire certificate' })
  @ApiQuery({ name: 'id', example: 'uuid-string' })
  @ApiBody({
    type: UpdateEntireCertificateDto,
    examples: {
      example1: {
        value: {
          statusAccounting: true,
          note: 'Accounting approved',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'EntireCertificate updated successfully.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  update(
    @Query('id') id: string,
    @Body() dto: UpdateEntireCertificateDto,
  ): Promise<DataWrapper<entireCertificate>> {
    return this.entirecertificateService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('deletedata')
  @ApiOperation({ summary: 'Delete an entire certificate' })
  @ApiQuery({ name: 'id', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'EntireCertificate deleted successfully.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  remove(@Query('id') id: string): Promise<DataWrapper<{ message: string }>> {
    return this.entirecertificateService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('latestnumber')
  @ApiOperation({ summary: 'Get the latest orderbillNo of a certificate type' })
  @ApiQuery({ name: 'type', example: 'Form A' })
  @ApiResponse({ status: 200, description: 'Returns the maximum orderbillNo (0 if none).' })
  getLatestOrderbillNo(
    @Query('type') type: string,
  ): Promise<DataWrapper<{ orderbillNo: number }>> {
    return this.entirecertificateService.getLatestOrderbillNo(type);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('filterbytype')
  @ApiOperation({ summary: 'Get entire certificates by type' })
  @ApiQuery({ name: 'type', example: 'Form A' })
  @ApiResponse({ status: 200, description: 'Returns the entire certificate records.' })
  filterByType(@Query('type') type: string): Promise<DataWrapper<entireCertificate[]>> {
    return this.entirecertificateService.filterByType(type);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('filterbyday')
  @ApiOperation({ summary: 'Filter by date range (startDate–endDate, inclusive)' })
  @ApiQuery({ name: 'startDate', example: '2026-05-11T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', example: '2026-05-11T23:59:59.999Z' })
  @ApiQuery({ name: 'type', required: false, description: TYPE_QUERY_DESCRIPTION })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  @ApiResponse({ status: 400, description: 'Invalid date.' })
  filterByDay(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: string,
  ): Promise<DataWrapper<entireCertificate[]>> {
    return this.entirecertificateService.filterByDay(startDate, endDate, type);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('filterbymonth')
  @ApiOperation({ summary: 'Filter by month and year' })
  @ApiQuery({ name: 'month', example: '6' })
  @ApiQuery({ name: 'year', example: '2026' })
  @ApiQuery({ name: 'type', required: false, description: TYPE_QUERY_DESCRIPTION })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  @ApiResponse({ status: 400, description: 'Invalid month or year.' })
  filterByMonth(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('type') type?: string,
  ): Promise<DataWrapper<entireCertificate[]>> {
    return this.entirecertificateService.filterByMonth(month, year, type);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('filterbyyear')
  @ApiOperation({ summary: 'Filter by year' })
  @ApiQuery({ name: 'year', example: '2026' })
  @ApiQuery({ name: 'type', required: false, description: TYPE_QUERY_DESCRIPTION })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  @ApiResponse({ status: 400, description: 'Invalid year.' })
  filterByYear(
    @Query('year') year: string,
    @Query('type') type?: string,
  ): Promise<DataWrapper<entireCertificate[]>> {
    return this.entirecertificateService.filterByYear(year, type);
  }
}
