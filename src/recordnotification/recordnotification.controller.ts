import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { validate_Check_Weight } from '@prisma/client';
import { LicenseHistoryResponse } from 'src/common/license-history';
import { LICENSE_HISTORY_EXAMPLE } from 'src/common/license-history.swagger';
import { UpdateCheckWeightData, ValidateCheckWeightDto } from 'src/dto/recordNoti.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import {
  CheckWeightByDateResult,
  CheckWeightDetailResult,
  MessageDataResponse,
  ProcessCheckWeightResult,
  RecordnotificationService,
} from './recordnotification.service';

const CHECK_WEIGHT_DETAIL_EXAMPLE = {
  message: 'Check weight data retrieved successfully',
  data: {
    checkWeightID: '2ff49ff2-b0f8-4d1e-9d27-7cbb8adf5be7',
    jobID: 86,
    staffID: '3f15ef10-3561-4693-b2f3-441825aada30',
    staffName: null,
    status: true,
    supplierName: 'HEALTHY RICE CO., LTD.',
    time: '2026-05-21T19:30:00.000Z',
    noOfBags: 2350,
    grossWeight: 3,
    netWeightW: 2,
    netWeightTon: 21.3145,
    totalGrossWeight: 7050,
    totalNetWeight: 4700,
    totalTareWeight: 4700,
    remainWeight: null,
    weightPerTon: 0,
    goDown: 'ท่าเรือกรุงเทพ/แหลมฉบัง',
    loadingDetails: '-',
    specialJob: null,
    statusContinue: '-',
    note: '-',
    vehicleName: 'cc',
    riceName: 'ข้าวขาวหอมไทย 100%',
    quantity: 2350,
    descriptionID: 'e991b31e-2b83-4eac-a33b-346c6b8101fd',
    requestID: '1b0bcc6c-15f8-4d73-9230-43a6d3dfa9a8',
    description: {
      destination: 'UNITED STATES OF AMERICA',
      licenseDetailID: '8c545be6-e4ac-413d-8eb1-71657184d00c',
    },
    request: {
      licenseNumber: '0308116919489',
      shippingDateTime: '2026-05-14T19:30:00.000Z',
      requestBy: 'ธกร',
    },
    remainNetWeightKGM: 16614.5,
  },
};

@ApiTags('RecordNotification')
@ApiBearerAuth()
@Controller('recordnotification')
export class RecordnotificationController {
  constructor(private readonly recordnotificationService: RecordnotificationService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process check-weight jobs',
    description:
      'บันทึก NotificationReceipt ทุกรายการ แล้วสร้าง/อัปเดต check weight สำหรับ jobName = "Checkweight" และเปลี่ยนสถานะ request เป็น completed (ทำใน transaction เดียว)',
  })
  @ApiBody({ type: [ValidateCheckWeightDto] })
  @ApiResponse({ status: 201, description: 'Successfully processed check weight data (updated / created counts).' })
  @Post('postdata')
  processCheckWeights(@Body() dtoList: ValidateCheckWeightDto[]): Promise<ProcessCheckWeightResult> {
    return this.recordnotificationService.processCheckWeights(dtoList);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get check weight by ID (with remaining license weight)' })
  @ApiQuery({
    name: 'checkWeightID',
    required: true,
    type: String,
    description: 'ID of the check weight record',
    example: '2ff49ff2-b0f8-4d1e-9d27-7cbb8adf5be7',
  })
  @ApiResponse({ status: 200, description: 'Check weight data retrieved successfully.', schema: { example: CHECK_WEIGHT_DETAIL_EXAMPLE } })
  @ApiResponse({ status: 404, description: 'No data found for the given check weight ID.' })
  @Get('getcheckweightdata')
  getCheckWeightById(
    @Query('checkWeightID') checkWeightID: string,
  ): Promise<MessageDataResponse<CheckWeightDetailResult>> {
    return this.recordnotificationService.getCheckWeightById(checkWeightID);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get check weights whose request date falls on the given day' })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'Request date', example: '2026-05-14' })
  @ApiResponse({ status: 200, description: 'Check weight data retrieved successfully by date.' })
  @ApiResponse({ status: 400, description: 'Invalid date format.' })
  @ApiResponse({ status: 404, description: 'No check weight data found for the given date.' })
  @Get('getcheckweightdatafilterbydate')
  getCheckWeightsByDate(
    @Query('date') date: string,
  ): Promise<MessageDataResponse<CheckWeightByDateResult[]>> {
    return this.recordnotificationService.getCheckWeightsByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update check weight',
    description:
      'อัปเดตน้ำหนัก ตัดยอดคงเหลือใน BufferRemain และสร้าง/อัปเดต certificatesheet (ทำใน transaction เดียว)',
  })
  @ApiQuery({ name: 'checkweightid', required: true, type: String, description: 'ID of the check weight record' })
  @ApiBody({ type: UpdateCheckWeightData })
  @ApiResponse({ status: 200, description: 'Check weight data and certificatesheet updated successfully.' })
  @ApiResponse({ status: 400, description: 'No licenseDetailID linked, or weight exceeds remaining license weight.' })
  @ApiResponse({ status: 404, description: 'Check weight or BufferRemain not found.' })
  @Put('updatecheckweightdata')
  updateCheckWeight(
    @Query('checkweightid') checkWeightID: string,
    @Body() dto: UpdateCheckWeightData,
  ): Promise<MessageDataResponse<validate_Check_Weight>> {
    return this.recordnotificationService.updateCheckWeight(checkWeightID, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get license usage history grouped by license detail' })
  @ApiQuery({ name: 'licensenumber', required: true, type: String, description: 'License Number', example: '0308116917947' })
  @ApiResponse({ status: 200, description: 'License history retrieved successfully.', schema: { example: LICENSE_HISTORY_EXAMPLE } })
  @Get('licensehistory')
  getLicenseHistory(@Query('licensenumber') licenseNumber: string): Promise<LicenseHistoryResponse> {
    return this.recordnotificationService.getLicenseHistory(licenseNumber);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get check weights matching a job number OR a license number' })
  @ApiQuery({ name: 'jobno', required: true, type: String, description: 'Job number', example: '9999' })
  @ApiQuery({ name: 'licenseid', required: true, type: String, description: 'License number', example: '0308116838587' })
  @ApiResponse({ status: 200, description: 'Check weight data retrieved successfully by jobNo and licenseId.' })
  @ApiResponse({ status: 404, description: 'No check weight data found.' })
  @Get('getcheckweightdatafilterbyjobnoandlicenseid')
  getCheckWeightsByJobNoOrLicense(
    @Query('jobno') jobNo: string,
    @Query('licenseid') licenseNumber: string,
  ): Promise<MessageDataResponse<validate_Check_Weight[]>> {
    return this.recordnotificationService.getCheckWeightsByJobNoOrLicense(jobNo, licenseNumber);
  }
}
