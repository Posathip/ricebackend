import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class ValidateCheckWeightDto {
  @ApiProperty({ example: 'd28b7a2f-d57f-4a45-8a44-3accf5026096', description: 'descriptionID (1 description = 1 check weight)' })
  @IsString()
  descriptionID!: string;

  @ApiProperty({ example: 'a12d66cb-fcfa-4cca-bc36-74669a9639e7', description: 'requestID ของ description นี้ — ใช้อัปเดตข้อมูลงานใน Request' })
  @IsString()
  requestID!: string;

  @ApiProperty({ example: false, required: false, default: false, description: 'ไม่ได้ใช้ — check weight ถูกตั้ง status = false เสมอ' })
  @IsBoolean()
  @IsOptional()
  status?: boolean = false;

  @ApiProperty({ example: '2a3b881e-d0be-42c3-bac1-87c2dfaf135a', required: false, description: 'staffID (ต้องมีในตาราง staff) → Request.staffID' })
  @IsString()
  @IsOptional()
  staffID?: string;

  @ApiProperty({ example: 401, required: false, description: 'เลข job (ห้ามซ้ำกับ request อื่น) → Request.jobID' })
  @IsInt()
  @IsOptional()
  jobID?: number;

  @ApiProperty({ example: '', required: false, description: 'หมายเหตุ (บันทึกใน check weight)' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'ต่อ', required: false, description: 'สถานะต่อเนื่อง (บันทึกใน check weight)' })
  @IsString()
  @IsOptional()
  statusContinue?: string;

  @ApiProperty({ example: 'พสธิป สถาพร', required: false, description: 'ใช้เป็นชื่อพนักงานใน check weight เมื่อหา staffID ในตาราง staff ไม่เจอ' })
  @IsString()
  @IsOptional()
  staffName?: string;

  @ApiProperty({ example: 'A', required: false, description: 'งานพิเศษ → Request.specialJob ("" = null)' })
  @IsString()
  @IsOptional()
  specialJob?: string;

  @ApiProperty({ example: 'Checkweight', required: false, description: '"Checkweight" = สร้าง/อัปเดต check weight ด้วย, ค่าอื่น = อัปเดตแค่ Request → Request.jobName' })
  @IsString()
  @IsOptional()
  jobName?: string;

  @ApiProperty({ example: '2026-11-19T08:30:00.000+07:00', required: false, description: 'เวลาเริ่มปฏิบัติงาน (ISO 8601) → บันทึกลง Request' })
  @IsDateString()
  @IsOptional()
  startTimeOperation?: string;

  @ApiProperty({ example: '2026-11-19T11:45:00.000+07:00', required: false, description: 'เวลาสิ้นสุดปฏิบัติงาน (ISO 8601) ต้องไม่ก่อนเวลาเริ่ม → บันทึกลง Request' })
  @IsDateString()
  @IsOptional()
  stopTimeOperation?: string;
}

export class UpdateCheckWeightData {
  @ApiProperty({ example: 'คำสั่งจ่ายงาน', required: false })
  @IsOptional()
  jobID?: number; // รหัสคำสั่งงาน

  @ApiProperty({ example: 'หมายเลขไอดีพนักงาน', required: false })
  @IsString()
  @IsOptional()
  staffID?: string;



  @ApiProperty({ example: false, description: 'สถานะข้อมูลน้ำหนัก (default: false)' })
  @IsBoolean()
  @IsOptional()
  status?: boolean = false;

  

  @ApiProperty({ example: '10:30 AM', required: false })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({ example: 'MV Ocean Star', required: false })
  @IsString()
  @IsOptional()
  vehicleName?: string;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
 quantity?: number;

  @ApiProperty({ example: 1500.75, required: false })
  @IsNumber()
  @IsOptional()
  grossWeight?: number;

  @ApiProperty({ example: 1450.5, required: false })
  @IsNumber()
  @IsOptional()
  netWeightW?: number;

  @ApiProperty({ example: 1.45, required: false })
  @IsNumber()
  @IsOptional()
  netWeightTon?: number;

  @ApiProperty({ example: 3000.0, required: false })
  @IsNumber()
  @IsOptional()
  totalGrossWeight?: number;

  @ApiProperty({ example: 2900.0, required: false })
  @IsNumber()
  @IsOptional()
  totalNetWeight?: number;

  @ApiProperty({ example: 100.0, required: false })
  @IsNumber()
  @IsOptional()
  totalTareWeight?: number;

  @ApiProperty({ example: 50.25, required: false })
  @IsNumber()
  @IsOptional()
  remainWeight?: number;

  @ApiProperty({ example: 1000.0, required: false })
  @IsNumber()
  @IsOptional()
  weightPerTon?: number;

  @ApiProperty({ example: 'Shipment A - Warehouse 3', required: false })
  @IsString()
  @IsOptional()
  loadingDetails?: string;

  // @ApiProperty({ example: 'Jasmine Rice 100%', required: false })
  // @IsString()
  // @IsOptional()
  // riceName?: string;

  @ApiProperty({ example: 'หมายเหตุ', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
