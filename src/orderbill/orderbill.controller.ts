import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { orderBill } from '@prisma/client';
import {
  CreateExtraInvoiceDto,
  CreatePhysicalAnalysisDto,
  CreateSellingLiquidsDto,
  UpdateDataAnalysisDto,
  UpdateExtraInvoiceDto,
  UpdateOrderStatusDto,
  UpdateSellingLiquidsDto,
} from 'src/dto/orderBill.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {
  MessageDataResponse,
  MessageResponse,
  OrderBillDetail,
  OrderbillService,
} from './orderbill.service';

@ApiTags('Orderbill')
@ApiBearerAuth()
@Controller('orderbill')
export class OrderbillController {
  constructor(private readonly orderbillService: OrderbillService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('postdataanalysis')
  @ApiOperation({ summary: 'Create order bill with physical analysis' })
  @ApiBody({ type: CreatePhysicalAnalysisDto })
  @ApiResponse({ status: 200, description: 'Order bill data created successfully.' })
  createPhysicalAnalysis(@Body() dto: CreatePhysicalAnalysisDto): Promise<MessageResponse> {
    return this.orderbillService.createPhysicalAnalysis(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('postdataextrainvoice')
  @ApiOperation({ summary: 'Create order bill with extra invoice' })
  @ApiBody({ type: CreateExtraInvoiceDto })
  @ApiResponse({ status: 200, description: 'Extra invoice data created successfully.' })
  createExtraInvoice(@Body() dto: CreateExtraInvoiceDto): Promise<MessageResponse> {
    return this.orderbillService.createExtraInvoice(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('postdatasellingliquids')
  @ApiOperation({ summary: 'Create order bill with selling liquids' })
  @ApiBody({ type: CreateSellingLiquidsDto })
  @ApiResponse({ status: 200, description: 'Order Liquid data created successfully.' })
  createSellingLiquids(@Body() dto: CreateSellingLiquidsDto): Promise<MessageResponse> {
    return this.orderbillService.createSellingLiquids(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getorderbilldatabydate')
  @ApiOperation({ summary: 'Get order bills of a given day' })
  @ApiQuery({ name: 'date', type: String, required: true, example: '2026-05-11' })
  @ApiResponse({ status: 200, description: 'Order bill data retrieved successfully by date.' })
  @ApiResponse({ status: 404, description: 'No order bill data found for the given date.' })
  getOrderBillsByDate(@Query('date') date: string): Promise<MessageDataResponse<orderBill[]>> {
    return this.orderbillService.getOrderBillsByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('deleteorderbilldata')
  @ApiOperation({ summary: 'Delete order bill by ID' })
  @ApiQuery({ name: 'billid', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Order bill data deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Order bill data not found.' })
  deleteOrderBill(@Query('billid') orderBillID: string): Promise<MessageResponse> {
    return this.orderbillService.deleteOrderBill(orderBillID);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('getorderbilldetail')
  @ApiOperation({ summary: 'Get order bill detail (analysis, invoices, liquids) by ID' })
  @ApiQuery({ name: 'orderbillid', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Order bill data retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Order bill data not found.' })
  getOrderBillDetail(
    @Query('orderbillid') orderBillID: string,
  ): Promise<MessageDataResponse<OrderBillDetail>> {
    return this.orderbillService.getOrderBillDetail(orderBillID);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatestatus')
  @ApiOperation({ summary: 'Update status of multiple order bills' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order bill status updated successfully.' })
  @ApiResponse({ status: 400, description: 'No order bills provided for status update.' })
  updateStatus(@Body() dto: UpdateOrderStatusDto): Promise<MessageResponse> {
    return this.orderbillService.updateStatus(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatedataanalysis')
  @ApiOperation({ summary: 'Update physical analysis data' })
  @ApiQuery({ name: 'physicaldataanalysisid', type: String, required: true })
  @ApiBody({ type: UpdateDataAnalysisDto })
  @ApiResponse({ status: 200, description: 'Physical analysis data updated successfully.' })
  @ApiResponse({ status: 404, description: 'Physical analysis data not found.' })
  updatePhysicalAnalysis(
    @Query('physicaldataanalysisid') physicalAnalysisID: string,
    @Body() dto: UpdateDataAnalysisDto,
  ): Promise<MessageResponse> {
    return this.orderbillService.updatePhysicalAnalysis(physicalAnalysisID, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatedataextrainvoice')
  @ApiOperation({ summary: 'Update extra invoice data' })
  @ApiQuery({ name: 'extrainvoiceid', type: String, required: true })
  @ApiBody({ type: UpdateExtraInvoiceDto })
  @ApiResponse({ status: 200, description: 'Extra invoice data updated successfully.' })
  @ApiResponse({ status: 404, description: 'Extra invoice data not found.' })
  updateExtraInvoice(
    @Query('extrainvoiceid') extraInvoiceID: string,
    @Body() dto: UpdateExtraInvoiceDto,
  ): Promise<MessageResponse> {
    return this.orderbillService.updateExtraInvoice(extraInvoiceID, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('updatedatasellingliquids')
  @ApiOperation({ summary: 'Update selling liquids data' })
  @ApiQuery({ name: 'sellingliquidsid', type: String, required: true })
  @ApiBody({ type: UpdateSellingLiquidsDto })
  @ApiResponse({ status: 200, description: 'Selling liquids data updated successfully.' })
  @ApiResponse({ status: 404, description: 'Selling liquids data not found.' })
  updateSellingLiquids(
    @Query('sellingliquidsid') sellingLiquidsID: string,
    @Body() dto: UpdateSellingLiquidsDto,
  ): Promise<MessageResponse> {
    return this.orderbillService.updateSellingLiquids(sellingLiquidsID, dto);
  }
}
