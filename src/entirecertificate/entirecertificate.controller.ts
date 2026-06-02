import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {
  CreateEntireCertificateDto,
  UpdateEntireCertificateDto,
} from 'src/dto/entirecertificate.dto';
import { EntirecertificateService } from './entirecertificate.service';

@ApiTags('EntireCertificate')
@Controller('entirecertificate')
export class EntirecertificateController {
  constructor(private readonly entirecertificateService: EntirecertificateService) {}

  @UseGuards(JwtAuthGuard)
  @Get('getdata')
  @ApiOperation({ summary: 'Get all entire certificates' })
  @ApiResponse({ status: 200, description: 'Returns all entire certificate records.' })
  getAll(@Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply) {
    return this.entirecertificateService.getAll(request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getbyid')
  @ApiOperation({ summary: 'Get entire certificate by ID' })
  @ApiQuery({ name: 'id', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Returns the entire certificate record.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  getById(
    @Query('id') id: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.getById(id, request, response);
  }

  @UseGuards(JwtAuthGuard)
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
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'EntireCertificate created successfully.' })
  create(
    @Body() dto: CreateEntireCertificateDto,
    @Res({ passthrough: true }) response: FastifyReply,
    @Req() request: any,
  ) {
    return this.entirecertificateService.create(dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
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
    @Res({ passthrough: true }) response: FastifyReply,
    @Req() request: any,
  ) {
    return this.entirecertificateService.update(id, dto, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deletedata')
  @ApiOperation({ summary: 'Delete an entire certificate' })
  @ApiQuery({ name: 'id', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'EntireCertificate deleted successfully.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  remove(@Query('id') id: string, @Req() request: any, @Res({ passthrough: true }) response: FastifyReply) {
    return this.entirecertificateService.remove(id, request, response);
  }


  @UseGuards(JwtAuthGuard)
  @Get('latestnumber')
  @ApiOperation({ summary: 'Get the latest orderbillNo' })
  @ApiResponse({ status: 200, description: 'Returns the maximum orderbillNo.' })
  getLatestNumber(
     @Query('type') type: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.getLatestNumber(type,request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filterbytype')
  @ApiOperation({ summary: 'Get entire certificate by type' })
  @ApiQuery({ name: 'type', example: 'Form A' })
  @ApiResponse({ status: 200, description: 'Returns the entire certificate records.' })
  @ApiResponse({ status: 404, description: 'EntireCertificate not found.' })
  filterByType(
    @Query('type') type: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.filterByType(type, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filterbyday')
  @ApiOperation({ summary: 'Filter by date range (startDate–endDate)' })
  @ApiQuery({ name: 'startDate', example: '2026-06-01' })
  @ApiQuery({ name: 'endDate', example: '2026-06-30' })
  @ApiQuery({ name: 'type', example: 'Form A', description: 'Use "All" to skip type filter' })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  filterByDay(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.filterByDay(startDate, endDate, type, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filterbymonth')
  @ApiOperation({ summary: 'Filter by month and year' })
  @ApiQuery({ name: 'month', example: '6' })
  @ApiQuery({ name: 'year', example: '2026' })
  @ApiQuery({ name: 'type', example: 'Form A', description: 'Use "All" to skip type filter' })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  filterByMonth(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('type') type: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.filterByMonth(month, year, type, request, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filterbyyear')
  @ApiOperation({ summary: 'Filter by year' })
  @ApiQuery({ name: 'year', example: '2026' })
  @ApiQuery({ name: 'type', example: 'Form A', description: 'Use "All" to skip type filter' })
  @ApiResponse({ status: 200, description: 'Returns filtered records.' })
  filterByYear(
    @Query('year') year: string,
    @Query('type') type: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.entirecertificateService.filterByYear(year, type, request, response);
  }

    
}
