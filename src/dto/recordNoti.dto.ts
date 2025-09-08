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
  @ApiProperty({ example: 'desc123' })
  @IsString()
  descriptionID: string;

  @ApiProperty({ example: 'req123', required: false })
  @IsString()
  requestID: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean = false; // default value false

  @ApiProperty({ example: 'staff123', required: false })
  @IsString()
  @IsOptional()
  staffID?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  jobID?: number;
}

export class UpdateCheckWeightData {
  @ApiProperty({ example: 'คำสั่งจ่ายงาน', required: false })
  
  @IsOptional()
  jobID?: number; // ชื่อ job id

  @ApiProperty({ example: 'หมายเลขไอดีพนักงาน', required: false })
  @IsString()
  @IsOptional()
  staffID?: string;

  @ApiProperty({ example: 'ชื่อพนักงาน', required: false })
  @IsString()
  @IsOptional()
  staffName?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({ example: 'Supplier', required: false })
  @IsString()
  @IsOptional()
  supplierName?: string;

  @ApiProperty({ example: 'เวลา', required: false })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({ example: 'Vessel', required: false })
  @IsString()
  @IsOptional()
  vesselName?: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  noOfBags?: number;

  @ApiProperty({ example: 1000.5, required: false })
  @IsNumber()
  @IsOptional()
  grossWeight?: number;

  @ApiProperty({ example: 950.0, required: false })
  @IsNumber()
  @IsOptional()
  nettWeight?: number;

  @ApiProperty({ example: 2000.0, required: false })
  @IsNumber()
  @IsOptional()
  totalGrossWeight?: number;

  @ApiProperty({ example: 1900.0, required: false })
  @IsNumber()
  @IsOptional()
  totalNetWeight?: number;

  @ApiProperty({ example: 100.0, required: false })
  @IsNumber()
  @IsOptional()
  totalTareWeight?: number;

  @ApiProperty({ example: 50.0, required: false })
  @IsNumber()
  @IsOptional()
  remainWeight?: number;

  @ApiProperty({ example: 1000.0, required: false })
  @IsNumber()
  @IsOptional()
  weightPerTon?: number;

  @ApiProperty({ example: 'รายละเอียดการโหลด', required: false })
  @IsString()
  @IsOptional()
  loadingDetails?: string;

  @ApiProperty({ example: 'หมายเหตุ', required: false })
  @IsString()
  @IsOptional()
  note?: string;



}
