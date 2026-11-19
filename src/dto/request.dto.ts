import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDescriptionDto {
  
    @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseDetailID?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionID?: string;

  @ApiProperty({ example: 'Bangkok' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: 'ข้าวขาวหอมมะลิไทย' })
  @IsString()
  riceType!: string;

  @ApiProperty({ example: 'Truck A' })
  @IsString()
  vehicleName!: string;

  @ApiProperty({ example: 'Marker001' })
  @IsString()
  marker!: string;

  @ApiProperty({ example: '528072' })
  @IsString()
  licenseNumber!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  quantityUnit!: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  grossWeight!: number;

  @ApiPropertyOptional({ example: 115 })
  @IsOptional()
  @IsNumber()
  netWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  netWeightW?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  netWeightKGM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  netWeightTON?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  portName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  index?: number;

  // @ApiPropertyOptional()
  // @ApiProperty({ example: 'เอาค่า Netweight KGM ที่ให้ไปตอนแรกของเส้น http://localhost:4000/trade/licensequery ส่งมาด้วยๆเพราะอันนั้นคือ Remain ' })
  // @IsOptional()
  // @IsNumber()
  // remainNetWeightKGM?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'บริษัท 16 ไอโอทีอี จำกัดมหาชน' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: 'ite admin' })
  @IsString()
  requestBy!: string;

  @ApiProperty({ example: '2025-08-11T10:00:00.000Z' })
  @IsString()
  requestDate!: string;

  @ApiProperty({ example: '2025-08-16T13:30:00.000Z' })
  @IsString()
  shippingDateTime!: string;

  @ApiProperty({ example: 'ไร่ข้าวหอมบ้านป่าบง' })
  @IsString()
  surveyLocateNameThai!: string;

  @ApiProperty({ example: 'Ban Pa Bong Aromatic Rice Farm' })
  @IsString()
  surveyLocateNameEng!: string;

  @ApiProperty({ example: 'บริษัท รุ่งเรืองค้าข้าว จำกัด' })
  @IsString()
  surveyPaidBy!: string;

  @ApiProperty({ example: 'เชียงใหม่' })
  @IsString()
  surveyProvince!: string;

  @ApiProperty({ example: 'สันทราย' })
  @IsString()
  surveySubDistrict!: string;

  @ApiProperty({ example: '0891234567' })
  @IsString()
  telInspector!: string;

  @ApiProperty({ example: '0887654321' })
  @IsString()
  telDebtor!: string;

  @ApiProperty({ example: '0308116838587' })
  @IsString()
  licenseNumber!: string;

  @ApiProperty({ example: 'เรียกเก็บเงิน' })
  @IsString()
  payer!: string;

  @ApiProperty({ type: [CreateOrderDescriptionDto] })
  @IsArray()
  @ArrayNotEmpty()
  description!: CreateOrderDescriptionDto[];
}


export class UpdateOrderDescriptionDto {
  @ApiPropertyOptional({ description: 'มีในระบบ = อัปเดต / ไม่มีในระบบ = สร้างใหม่ / ไม่ส่ง = ข้ามรายการนี้' })
  @IsOptional()
  @IsString()
  descriptionID?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() licenseDetailID?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destination?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() riceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() marker?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() licenseNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() quantityUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() grossWeight?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() netWeightW?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() netWeightKGM?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() netWeightTON?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() index?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requestBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requestDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shippingDateTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surveyLocateNameThai?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surveyLocateNameEng?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surveyPaidBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surveyProvince?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surveySubDistrict?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telInspector?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telDebtor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() payer?: string;

  @ApiPropertyOptional({ type: [UpdateOrderDescriptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDescriptionDto)
  description?: UpdateOrderDescriptionDto[];
}
