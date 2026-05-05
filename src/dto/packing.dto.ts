import { IsString, IsOptional } from 'class-validator';

export class CreatePackingDto {
  @IsOptional()
  @IsString()
  packingName?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class UpdatePackingDto {
  @IsOptional()
  @IsString()
  packingName?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}

