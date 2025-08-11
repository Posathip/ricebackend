import { IsString, IsBoolean, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhysicalAnalysisDto {
    @ApiProperty({ example: 'completed' })
    @IsString()
    status: string;

    @ApiProperty({ example: 'ORD12345' })
    @IsString()
    orderNo: string;

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    date: Date;

    @ApiProperty({ example: 'Acme Rice Co.' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    physicalAnalysis: boolean;

    @ApiProperty({ example: ['Moisture', 'Protein'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    physicalChemical: string[];

    @ApiProperty({ example: 1500, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    totalPrice?: number;

    @ApiProperty({ example: 'Urgent order', required: false })
    @IsOptional()
    @IsString()
    note?: string;
}

export class CreateExtraInvoiceDto {
    @ApiProperty({ example: 'pending' })
    @IsString()
    status: string;

    @ApiProperty({ example: 'ORD12345' })
    @IsString()
    orderNo: string;

    @ApiProperty({ example: 'Acme Rice Co.' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: 10, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    numberSample: string;

    @ApiProperty({ example: 100, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pricePerUnit?: number;

    @ApiProperty({ example: 1000, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    totalPrice?: number;

    @ApiProperty({ example: 'Extra charge for rush', required: false })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    date: Date;
}

export class CreateSellingLiquidsDto {
    @ApiProperty({ example: 'completed' })
    @IsString()
    status: string;

    @ApiProperty({ example: 'ORD12345' })
    @IsString()
    orderNo: string;

    @ApiProperty({ example: 'Acme Rice Co.' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    date: Date;

    @ApiProperty({ example: true })
    @IsBoolean()
    liquidsBoolean: boolean;

    @ApiProperty({ example: 5, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    numberNo1?: number;

    @ApiProperty({ example: 200, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pricePerUnitNo1?: number;

    @ApiProperty({ example: 1000, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    totalPriceNo1?: number;

    @ApiProperty({ example: 3, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    numberNo2?: number;

    @ApiProperty({ example: 150, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pricePerUnitNo2?: number;

    @ApiProperty({ example: 450, required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    totalPriceNo2?: number;
}

class OrderItemDto {
    @ApiProperty({ example: 'a3e1b2c4-5678-1234-9abc-def012345678' })
    @IsUUID()
    orderbillID: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ example: 'completed' })
    @IsString()
    status: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    order: OrderItemDto[];
}