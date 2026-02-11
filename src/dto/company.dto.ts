
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Length,
  isNotEmpty,
  ArrayNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateCompanyDto {
  
  @IsString()
  @IsNotEmpty()
  companyNameEN!: string;

  @IsString()
  @IsNotEmpty()
  companyNameTH!: string;

  @IsString()
  @IsNotEmpty()
  companyDescription!: string;
}