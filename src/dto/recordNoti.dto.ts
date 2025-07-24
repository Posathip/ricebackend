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

export class updateCheckWeightData {
    @IsUUID()
  @IsOptional() // Prisma auto-generates UUID
  checkWeightID?: string;

  @IsString()
  @IsOptional()
  loadingDetail1: string;

  @IsString()
  @IsOptional()
  time: string;

  @IsInt()
  @IsOptional()
  bagQuantity: number;

  @IsNumber()
  @IsOptional()
  grossWeight: number;

  @IsString()
  @IsOptional()
  jobID: string;

  @IsString()
  descriptionID: string;

  @IsNumber()
  @IsOptional()
  netWeight: number;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsString()
  requestID: string;

  @IsString()
  @IsOptional()
  riceTypeID: string;

  @IsDateString()
  @IsOptional()
  shippingDate: string; // e.g., "2025-07-24T08:00:00Z"

  @IsString()
  @IsOptional()
  staffID: string;

  @IsString()
  @IsOptional()
  statusContinue: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  @IsOptional()
  companyName: string;
}