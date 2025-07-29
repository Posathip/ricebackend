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
  @IsString()
  descriptionID: string;

  @IsString()
  requestID: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = false; // default value false

  @IsString()
  @IsOptional()
  staffID?: string;

  @IsInt()
  @IsOptional()
  jobID?: string;
}



export class UpdateCheckWeightData {
  @IsString()
  @IsOptional()
  jobID?: string; // ชื่อ job id

  @IsString()
  @IsOptional()
  staffID?: string;

  @IsString()
  @IsOptional()
  staffName?: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  vesselName?: string;

  @IsNumber()
  @IsOptional()
  noOfBags?: number;

  @IsNumber()
  @IsOptional()
  totalgrossWeight?: number;

  @IsNumber()
  @IsOptional()
  totalTareWeight?: number;

  @IsNumber()
  @IsOptional()
  nettWeight?: number;

  @IsNumber()
  @IsOptional()
  remainingWeight?: number;

  @IsString()
  @IsOptional()
  loadingDetails?: string;

  @IsString()
  @IsOptional()
  packingType?: string;

  @IsNumber()
  @IsOptional()
  packingDetailKgs?: number;

  @IsNumber()
  @IsOptional()
  packingDetailBags?: number;

  @IsString()
  @IsOptional()
  remark1?: string;

  @IsString()
  @IsOptional()
  remark2?: string;

  @IsString()
  @IsOptional()
  remark3?: string;

  @IsString()
  @IsOptional()
  remark4?: string;

  @IsNumber()
  @IsOptional()
  totalnetWeight?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  riceTypeID?: string;

  @IsDateString()
  @IsOptional()
  shippingDate?: string;

  @IsString()
  @IsOptional()
  statusContinue?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  descriptionID: string;

  @IsString()
  requestID: string;
}
