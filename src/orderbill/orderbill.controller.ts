import { OrderbillService } from './orderbill.service';
import { FastifyReply } from 'fastify';
import { Body, Controller, Delete, Get, Post, Put, Query, Req, Res } from '@nestjs/common';
import { CreateExtraInvoiceDto, CreatePhysicalAnalysisDto, CreateSellingLiquidsDto, UpdateDataAnalysisDto, UpdateExtraInvoiceDto, UpdateOrderStatusDto, UpdateSellingLiquidsDto,  } from 'src/dto/orderBill.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Orderbill')
@Controller('orderbill')
export class OrderbillController {
  constructor(private readonly orderbillService: OrderbillService) {}

  @Post('postdataanalysis')
  @ApiOperation({ summary: 'Post physical analysis data' })
  @ApiBody({ type: CreatePhysicalAnalysisDto })
  @ApiResponse({ status: 201, description: 'Physical analysis data posted successfully.' })
  postdata(
    @Body() dto: CreatePhysicalAnalysisDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.postDataAnalysis(dto, request, response);
  }

  @Post('postdataextrainvoice')
  @ApiOperation({ summary: 'Post extra invoice data' })
  @ApiBody({ type: CreateExtraInvoiceDto })
  @ApiResponse({ status: 201, description: 'Extra invoice data posted successfully.' })
  postdataextrainvoice(
    @Body() dto: CreateExtraInvoiceDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.postDataExtrainvoice(dto, request, response);
  }

  @Post('postdatasellingliquids')
  @ApiOperation({ summary: 'Post selling liquids data' })
  @ApiBody({ type: CreateSellingLiquidsDto })
  @ApiResponse({ status: 201, description: 'Selling liquids data posted successfully.' })
  postdatasellingLiquids(
    @Body() dto: CreateSellingLiquidsDto,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.postDataSellingLiquids(dto, request, response);
  }

  @Get('getorderbilldatabydate')
  @ApiOperation({ summary: 'Get order bill data by date' })
  @ApiQuery({ name: 'date', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Order bill data retrieved successfully.' })
  getOrderBillDataByDate(
    @Query('date') date: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.getOrderBillDataByDate(date, request, response);
  }

  @Delete('deleteorderbilldata')
  @ApiOperation({ summary: 'Delete order bill data by bill ID' })
  @ApiQuery({ name: 'billid', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Order bill data deleted successfully.' })
  deleteOrderBillData(
    @Query('billid') orderBillID: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.deleteOrderBillData(orderBillID, request, response);
  }

  @Get('getorderbilldetail')
  @ApiOperation({ summary: 'Get order bill detail by ID' })
  @ApiQuery({ name: 'orderbillid', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Order bill detail retrieved successfully.' })
  getOrderBillDataDetail(
    @Query('orderbillid') orderBillID: string,
    @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.getOrderBillDataDetail(orderBillID, request, response);
  }
  @Put('updatestatus')
  @ApiOperation({ summary: 'Update order bill status' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order bill status updated successfully.' })
  updatestatus(
    @Body() dto: UpdateOrderStatusDto,
     @Req() request: any,
    @Res({ passthrough: true }) response: FastifyReply,
  ){
    return this.orderbillService.updateStatus(dto, request, response);
  }
  @Put('updatedataanalysis')
  @ApiOperation({ summary: 'Update physical analysis data' })
  @ApiQuery({ name: 'physicaldataanalysisid', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Physical analysis data updated successfully.' })
  updatedataanalysis(
     @Query('physicaldataanalysisid') physicaldataanalysisID: string,
     @Body() dto: UpdateDataAnalysisDto,
     @Req() request: any,
     @Res({ passthrough: true }) response: FastifyReply,
  ) {
    return this.orderbillService.updatedataanalysis(physicaldataanalysisID, dto, request, response);
  }

    @Put('updatedataextrainvoice')
    @ApiOperation({ summary: 'Update extra invoice data' })
    @ApiQuery({ name: 'extrainvoiceid', type: String, required: true })
    @ApiBody({ type: UpdateExtraInvoiceDto })
    @ApiResponse({ status: 200, description: 'Extra invoice data updated successfully.' })
    updatedataextrainvoice(
      @Query('extrainvoiceid') extrainvoiceID: string,
      @Body() dto: UpdateExtraInvoiceDto,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply,
    ) {
      return this.orderbillService.updatedataextrainvoice(extrainvoiceID, dto, request, response);
    }


    @Put('updatedatasellingliquids')
    @ApiOperation({ summary: 'Update selling liquids data' })
    @ApiQuery({ name: 'sellingliquidsid', type: String, required: true })
    @ApiBody({ type: UpdateSellingLiquidsDto })
    @ApiResponse({ status: 200, description: 'Selling liquids data updated successfully.' })
    updatedatasellingliquids(
      @Query('sellingliquidsid') sellingLiquidsID: string,
      @Body() dto: UpdateSellingLiquidsDto,
      @Req() request: any,
      @Res({ passthrough: true }) response: FastifyReply,
    ) {
      return this.orderbillService.updatedatasellingliquids(sellingLiquidsID, dto, request, response);
    }
}
