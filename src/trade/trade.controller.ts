import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto, UpdateOrderDto, UpdateRequestJobDto } from 'src/dto/request.dto';
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
  UpdateRequestJobResponse,
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

const REQUESTS_BY_DATE_EXAMPLE = {
  success: true,
  data: [
    {
      requestID: 'a12d66cb-fcfa-4cca-bc36-74669a9639e7',
      companyName: 'ซี.พี.อินเตอร์เทรด จำกัด',
      licenseNumber: '0308116917947',
      status: 'completed',
      surveySubDistrict: 'ท่าม่วง',
      surveyLocateNameEng: 'KARNPANICH RICE MILL',
      surveyLocateNameThai: 'การพานิช-กาญจนบุรี',
      surveyProvince: 'กาญจนบุรี',
      shippingDateTime: '2026-11-19T07:30:00.000Z',
      jobID: 401,
      jobName: 'Checkweight',
      specialJob: 'A',
      staffID: '2a3b881e-d0be-42c3-bac1-87c2dfaf135a',
      staffName: '12 สมชาย ใจดี',
      startTimeOperation: '2026-11-19T01:30:00.000Z',
      stopTimeOperation: '2026-11-19T04:45:00.000Z',
      descriptions: [
        {
          index: 1,
          descriptionID: 'd28b7a2f-d57f-4a45-8a44-3accf5026096',
          licenseNumber: '0308116920068',
          riceType: 'ข้าวเจ้าขาวอื่น 100 %',
          quantity: 1760,
          destination: 'HONG KONG',
          vehicleName: 'lic',
          netWeightTON: 44,
        },
      ],
      validate_Check_Weight: [
        {
          checkWeightID: '2ff49ff2-b0f8-4d1e-9d27-7cbb8adf5be7',
          jobID: 401,
          status: false,
          staffName: 'สมชาย ใจดี',
          staffID: '2a3b881e-d0be-42c3-bac1-87c2dfaf135a',
          vehicleName: 'lic',
          riceName: 'ข้าวเจ้าขาวอื่น 100 %',
          quantity: null,
          netWeightTon: 44,
          totalNetWeight: null,
          grossWeight: 200,
          noOfBags: 1760,
          goDown: null,
          specialJob: 'A',
          statusContinue: 'ต่อ',
          descriptionID: 'd28b7a2f-d57f-4a45-8a44-3accf5026096',
        },
      ],
      companyNameEng: 'C.P. INTERTRADE CO., LTD.',
      goDownGroupID: null,
      goDownGroupName: null,
      goDownColor: null,
    },
  ],
  finalNo: 401,
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
  @ApiResponse({
    status: 200,
    description: [
      'Requests ของวันนั้น + finalNo (jobID สูงสุดในตาราง Request, "0000" ถ้ายังไม่มี)',
      'jobID / jobName / specialJob / staffID / startTimeOperation / stopTimeOperation มาจากตาราง Request',
      'staffName = "staffNo staffName" จากตาราง staff (ใช้ staffID)',
      'request ที่ซ้ำกัน (บริษัท + เลขใบอนุญาต + สถานที่ + เวลาส่ง + descriptions เหมือนกันทุกบรรทัด) ถูกซ่อน — ยกเว้นตัวที่มีการชั่งแล้วจะแสดงเสมอ; ถ้าทั้งกลุ่มยังไม่มีการชั่ง แสดง 1 ตัว (มี jobID > ล่าสุด)',
    ].join(' — '),
    schema: { example: REQUESTS_BY_DATE_EXAMPLE },
  })
  @ApiResponse({ status: 400, description: 'Invalid date format', schema: { example: { success: false, message: 'Invalid date format' } } })
  @ApiResponse({
    status: 404,
    description: 'ไม่มี request ในวันนั้น (ยังส่ง finalNo มาให้)',
    schema: { example: { success: false, message: 'No requests found for the given date', finalNo: 400 } },
  })
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
  @ApiOperation({
    summary: 'มอบหมาย/แก้ไขงานของแจ้งขอตรวจสอบ (jobID, jobName, specialJob, staffID, เวลาปฏิบัติงาน)',
    description: [
      'แก้ได้ครั้งละ 1 request — ระบุ `requestID` ใน body',
      'ส่งเฉพาะ field ที่ต้องการแก้ — field ที่ไม่ส่งจะไม่เปลี่ยน, ส่ง `null` เพื่อล้างค่า',
      '',
      '- `jobID` ต้องไม่ซ้ำกับ request อื่น (ซ้ำ → 409)',
      '- `staffID` ต้องมีอยู่ในตาราง staff (ไม่มี → 400) — ไม่ได้ผูก relation, ใช้ดึงชื่อมาแสดง',
      '- `stopTimeOperation` ต้องไม่ก่อน `startTimeOperation` (เทียบกับค่าเดิมใน DB ด้วยถ้าส่งมาแค่ตัวเดียว)',
      '- response คืนค่าล่าสุดของ request พร้อม `staffName` = "staffNo staffName" (format เดียวกับ getrequestbydate)',
    ].join('\n'),
  })
  @ApiBody({
    type: UpdateRequestJobDto,
    examples: {
      assignJob: {
        summary: 'มอบหมายงาน',
        value: {
          requestID: 'ac0ee0b2-38c5-4a32-b233-5d48fb20861c',
          jobID: 257,
          jobName: 'Checkweight',
          specialJob: 'A',
          staffID: '2a3b881e-d0be-42c3-bac1-87c2dfaf135a',
        },
      },
      recordOperationTime: {
        summary: 'บันทึกเวลาเริ่ม/สิ้นสุด',
        value: {
          requestID: 'ac0ee0b2-38c5-4a32-b233-5d48fb20861c',
          startTimeOperation: '2026-11-19T08:30:00.000+07:00',
          stopTimeOperation: '2026-11-19T11:45:00.000+07:00',
        },
      },
      unassignStaff: {
        summary: 'ยกเลิกพนักงาน',
        value: { requestID: 'ac0ee0b2-38c5-4a32-b233-5d48fb20861c', staffID: null },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Request job updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Request job updated successfully',
        data: {
          requestID: 'ac0ee0b2-38c5-4a32-b233-5d48fb20861c',
          jobID: 257,
          jobName: 'Checkweight',
          specialJob: 'A',
          staffID: '2a3b881e-d0be-42c3-bac1-87c2dfaf135a',
          startTimeOperation: '2026-11-19T01:30:00.000Z',
          stopTimeOperation: null,
          staffName: '12 สมชาย ใจดี',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error (เช่น ไม่มี requestID) / No fields to update / Staff not found / stop before start' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({
    status: 409,
    description: 'jobID ซ้ำกับ request อื่น',
    schema: { example: { success: false, message: 'jobID 257 is already used by another request', requestID: '...' } },
  })
  @Put('updaterequestjob')
  updateRequestJob(@Body() dto: UpdateRequestJobDto): Promise<UpdateRequestJobResponse> {
    return this.tradeService.updateRequestJob(dto);
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
