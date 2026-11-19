import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderDto } from 'src/dto/request.dto';
import { CreateSurveyDto } from 'src/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { THAI_PROVINCES } from './provinces.const';
import {
  FetchGovernmentDataResult,
  InspectPlace,
  RequestsByDateResponse,
  SuccessDataResponse,
  SuccessResponse,
  TradeService,
} from './trade.service';

const CREATE_REQUEST_EXAMPLE = {
  companyName: 'ซี.พี.อินเตอร์เทรด จำกัด',
  payer: 'ซี.พี.อินเตอร์เทรด จำกัด',
  requestBy: 'ธรรมรัตน์',
  requestDate: '2026-05-19T17:34:37.904+07:00',
  shippingDateTime: '2026-05-19T02:30:00.000+07:00',
  surveyLocateNameThai: 'การพานิช',
  surveyLocateNameEng: 'KARNPANICH RICE MILL',
  surveyPaidBy: '',
  surveyProvince: 'กาญจนบุรี',
  surveySubDistrict: 'ท่าม่วง',
  telInspector: '027667662',
  telDebtor: '',
  licenseNumber: '0308116917947',
  description: [
    {
      licenseDetailID: '002e19b7-4aeb-4ec4-b93d-5b1a25d14f08',
      index: 1,
      destination: 'HONG KONG',
      riceType: 'ข้าวเจ้าขาวอื่น 100 %',
      vehicleName: 'lic',
      marker: '',
      licenseNumber: '0308116920068',
      quantity: 1760,
      quantityUnit: 'BG',
      grossWeight: 200,
      netWeightW: 25,
      netWeightTON: 44,
      netWeightKGM: 40000,
    },
  ],
};

@ApiTags('Trade')
@ApiBearerAuth()
@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  // ─── Government license data ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Fetch today's licenses from the government SOAP service and store new ones" })
  @ApiResponse({ status: 200, description: 'Inserted / skipped counts.' })
  @Post('getdata')
  fetchTodayGovernmentData(): Promise<FetchGovernmentDataResult> {
    return this.tradeService.fetchTodayGovernmentData();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลใบอนุญาตจาก SOAP ตามช่วงวันที่ (ไม่บันทึกลงฐานข้อมูล)' })
  @ApiQuery({ name: 'startdate', required: true, example: '2026-05-19T00:00:00' })
  @ApiQuery({ name: 'enddate', required: true, example: '2026-05-19T23:59:59' })
  @ApiResponse({ status: 200, description: 'Raw license headers from the SOAP service.' })
  @Get('getlicensebydate')
  getGovernmentLicensesByDate(@Query('startdate') startDate: string, @Query('enddate') endDate: string) {
    return this.tradeService.getGovernmentLicensesByDate(startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลใบอนุญาต (พร้อมรายการสินค้า) ตามเลขใบอนุญาต' })
  @ApiQuery({ name: 'licenseNo', required: true, example: '0308116917947' })
  @ApiResponse({ status: 200, description: 'License data.' })
  @ApiResponse({ status: 404, description: 'No License Data.' })
  @Get('licensequery')
  getLicenseByNumber(@Query('licenseNo') licenseNumber: string) {
    return this.tradeService.getLicenseByNumber(licenseNumber);
  }

  // ─── Reference data ─────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลสถานที่ตรวจสอบ' })
  @ApiResponse({ status: 200, description: 'Inspection places.' })
  @Get('inspectplace')
  getInspectPlaces(): Promise<SuccessDataResponse<InspectPlace[]>> {
    return this.tradeService.getInspectPlaces();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลจังหวัด' })
  @ApiResponse({ status: 200, description: 'Thai provinces.' })
  @Get('province')
  getProvinces(): { provinces: readonly string[] } {
    return { provinces: THAI_PROVINCES };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'เพิ่มข้อมูลสถานที่ตรวจสอบ (SurveyName) หลายรายการ' })
  @ApiBody({ type: [CreateSurveyDto] })
  @ApiResponse({ status: 200, description: 'Survey posted successfully.' })
  @Post('postsurvey')
  createSurveys(@Body() dtoList: CreateSurveyDto[]): Promise<SuccessResponse> {
    return this.tradeService.createSurveys(dtoList);
  }

  // ─── Inspection requests ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'แจ้งขอตรวจสอบ' })
  @ApiBody({ type: CreateOrderDto, description: 'รายละเอียดการแจ้งขอตรวจสอบ', examples: { example1: { value: CREATE_REQUEST_EXAMPLE } } })
  @ApiResponse({ status: 200, description: 'Order created successfully.' })
  @Post('createrequest')
  createRequest(@Body() dto: CreateOrderDto): Promise<SuccessResponse> {
    return this.tradeService.createRequest(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลแจ้งขอตรวจสอบ' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'requestID' })
  @ApiResponse({ status: 200, description: 'Request with its descriptions.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  @Get('getrequest')
  getRequestById(@Query('id') id: string) {
    return this.tradeService.getRequestById(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ดึงข้อมูลแจ้งขอตรวจสอบโดยวันที่ (พร้อมเลข job ล่าสุด)' })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'Request date', example: '2026-05-19' })
  @ApiResponse({ status: 200, description: 'Requests of the day + finalNo.' })
  @ApiResponse({ status: 400, description: 'Invalid date format.' })
  @ApiResponse({ status: 404, description: 'No requests found for the given date (body still contains finalNo).' })
  @Get('getrequestbydate')
  getRequestsByDate(@Query('date') date: string): Promise<RequestsByDateResponse> {
    return this.tradeService.getRequestsByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'อัปเดตแจ้งขอตรวจสอบ และสร้าง/อัปเดตรายการย่อย' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'requestID' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  @Put('updaterequest')
  updateRequest(@Query('id') id: string, @Body() dto: UpdateOrderDto): Promise<SuccessResponse> {
    return this.tradeService.updateRequest(id.trim(), dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ลบข้อมูลการแจ้งขอตรวจสอบ (เฉพาะที่ยังไม่ส่งชั่งน้ำหนัก)' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'requestID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Order is submitted already cannot delete.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @Delete('deleteorder')
  deleteRequest(@Query('id') id: string): Promise<SuccessResponse> {
    return this.tradeService.deleteRequest(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ลบรายการย่อยของการแจ้งขอตรวจสอบ (เฉพาะที่ยังไม่ส่งชั่งน้ำหนัก)' })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'descriptionID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Already submitted for weight check.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @Delete('deletedescription')
  deleteDescription(@Query('id') id: string): Promise<SuccessResponse> {
    return this.tradeService.deleteDescription(id);
  }
}
