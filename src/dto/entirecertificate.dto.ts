import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEntireCertificateDto {
  @ApiPropertyOptional({ example: 1001 })
  @IsInt()
  @IsOptional()
  orderbillNo?: number;

  @ApiPropertyOptional({ example: 'Form A' })
  @IsString()
  @IsOptional()
  certificateType?: string;

  @ApiPropertyOptional({ example: 'ABC Co., Ltd.' })
  @IsString()
  @IsOptional()
  shipper?: string;

  @ApiPropertyOptional({ example: 'Japan' })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({ example: 'INV-2026-001' })
  @IsString()
  @IsOptional()
  invoice?: string;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'Laem Chabang Port' })
  @IsString()
  @IsNotEmpty()
  shipping!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  statusAccounting!: boolean;

  @ApiPropertyOptional({ example: '2026-06-02T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateEntireCertificateDto {
  @ApiPropertyOptional({ example: 1001 })
  @IsInt()
  @IsOptional()
  orderbillNo?: number;

  @ApiPropertyOptional({ example: 'Form A' })
  @IsString()
  @IsOptional()
  certificateType?: string;

  @ApiPropertyOptional({ example: 'ABC Co., Ltd.' })
  @IsString()
  @IsOptional()
  shipper?: string;

  @ApiPropertyOptional({ example: 'Japan' })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({ example: 'INV-2026-001' })
  @IsString()
  @IsOptional()
  invoice?: string;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ example: 'Laem Chabang Port' })
  @IsString()
  @IsOptional()
  shipping?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  statusAccounting?: boolean;

  @ApiPropertyOptional({ example: '2026-06-02T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date?: string;
}
