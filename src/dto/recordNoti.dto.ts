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

  @ApiProperty({ example: 'staff123 ', required: false })
  @IsString()
  @IsOptional()
  staffID?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  jobID?: number;

  @ApiProperty({ example: 'note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'ต่อ', required: false })
  @IsString()
  @IsOptional()
  statusContinue?: string;

  @ApiProperty({ example: 'พสธิป สถาพร', required: false })
  @IsString()
  @IsOptional()
  staffName?: string;

   @ApiProperty({ example: "A", required: false })
  @IsString()
  @IsOptional()
  specialJob?: string;
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
  vesselName?: string;

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
