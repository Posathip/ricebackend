import { IsOptional, IsString } from "class-validator";

export class CreateRiceManageDto {
  @IsString()
  @IsOptional()
  riceNameEng?: string;

  @IsString()
  @IsOptional()
  riceNameThai?: string;

  @IsString()
  @IsOptional()
  riceCodeT?: string;

  @IsString()
  @IsOptional()
  riceCode1?: string;

  @IsString()
  @IsOptional()
  riceCode2?: string;

  @IsString()
  @IsOptional()
  riceType?: string;
}

export class UpdateRiceManageDto {
  @IsString()
  @IsOptional()
  riceNameEng?: string;

  @IsString()
  @IsOptional()
  riceNameThai?: string;

  @IsString()
  @IsOptional()
  riceCodeT?: string;

  @IsString()
  @IsOptional()
  riceCode1?: string;

  @IsString()
  @IsOptional()
  riceCode2?: string;

  @IsString()
  @IsOptional()
  riceType?: string;
}