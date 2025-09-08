
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


export class CreateAccountAdmin {
  @ApiProperty({ example: 'dpim@gmail.com' })
  @IsString()
  email: string;

  @IsString()
  @ApiProperty({ example: 'adminagt' })
  password: string;

  @IsString()
  @ApiProperty({ example: 'Admin' })
  roleUserLevel: string;
  @IsString()
  @ApiProperty({ example: 'bob' })
  firstname: string;
  @IsString()
  @ApiProperty({ example: 'kane' })
  lastname: string;
  @IsString()
  @ApiProperty({ example: 'KMITL' })
  company: string;

  @ApiProperty({ example: '0978654423' })
  @IsString()
  tel: string;
}

export class CreateAccountUser {
  @ApiProperty({ example: 'dpim@gmail.com' })
  @IsString()
  email: string;

  @IsString()
  @ApiProperty({ example: 'admin' })
  roleUserLevel: string;

  // @IsString()
  // @ApiProperty({ example: 'CPF' })
  // company: string;

  // @ApiProperty({ example: '0978654423' })
  // @IsString()
  // tel: string;

  
}
export class CreateStaffDto {
  @ApiProperty({ example: '98576881-7323-49fc-aff1-78d35d1599bd' })
  @IsString()
  staffID: string;
 
  @ApiProperty({ example: '1' })
  @IsString()
  staffNo: string;
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  staffName?: string;

  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0812345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Manager', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  
}
export class LoginDTO {
    @ApiProperty({ example: 'dpim@dpim.com' })
    @IsEmail()
    public email: string;
  
    @ApiProperty({ example: 'dekeodmp' })
    @IsNotEmpty()
    @IsString()
    @Length(6, 10, { message: 'Password has to be between 6 and 10 character' })
    public password: string;
  }

  export class updateAccountUserDTO{
    @ApiProperty({ example: ["98576881-7323-49fc-aff1-78d35d1599bd","98576881-7323-49fc-aff1-78d35d1599bd"] })
    @IsArray()
    machine_Ref_ID: string[]
    


  }

  export class extractimageDTO{
    @ApiProperty({ example: '2023-08-27T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  machine_Ref_ID : string
    @ApiProperty({ example: '2023-08-27T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  startDate: Date
  @ApiProperty({ example: '2023-08-30T09:00:00.000Z' })

  @IsString()
  @IsOptional()
  endDate: Date
  }

  export class CreateSurveyDto {
    @ApiProperty({ example: 'Amphoe' })
    @IsString()
    amphoes: string;

    @ApiProperty({ example: 'Changwat' })
    @IsString()
    changwat: string;

    @ApiProperty({ example: 'สถานที่ตรวจสอบ EN' })
    @IsString()
    surveyNameEN: string;

    @ApiProperty({ example: 'สถานที่ตรวจสอบ TH' })
    @IsString()
    surveyNameTH: string;
  }