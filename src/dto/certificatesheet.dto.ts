import { IsOptional, IsString, IsInt, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateCertificateDto {
 @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  applyGodown?: boolean;


  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  certNo?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  paperNoOriginal?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  paperNoCopy?: number;

  @ApiPropertyOptional({ example: 'LN-998877' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  jobID?: number;



  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  index?: number;

  @ApiPropertyOptional({ example: 'Special export case' })
  @IsOptional()
  @IsString()
  specialJob?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  No?: number;

  @ApiPropertyOptional({ example: 'Certificate Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'ABC Co., Ltd.' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'คลังสินค้า A' })
  @IsOptional()
  @IsString()
  surveyLocateNameThai?: string;

  @ApiPropertyOptional({ example: 'Bangkok Port' })
  @IsOptional()
  @IsString()
  portName?: string;

  @ApiPropertyOptional({ example: 'Japan' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @IsNumber()
  netWeightTON?: number;

  @ApiPropertyOptional({ example: 'Jasmine Rice' })
  @IsOptional()
  @IsString()
  riceType?: string;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: '2026-04-21T09:58:46.560Z' })
  @IsOptional()
  @IsDateString()
  dateCertificate?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ example: 'bags' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 'Premium Thai Rice' })
  @IsOptional()
  @IsString()
  descriptionOfGoodsLine1?: string;

  @ApiPropertyOptional({ example: 'Grade A' })
  @IsOptional()
  @IsString()
  descriptionOfGoodsLine2?: string;

  @ApiPropertyOptional({ example: 'Export Quality' })
  @IsOptional()
  @IsString()
  descriptionOfGoodsLine3?: string;

  @ApiPropertyOptional({ example: '50kg per bag' })
  @IsOptional()
  @IsString()
  packing?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  unitKGS_Nett?: number;

  @ApiPropertyOptional({ example: 'MARK123' })
  @IsOptional()
  @IsString()
  marks?: string;

  @ApiPropertyOptional({ example: 'XYZ Exporter' })
  @IsOptional()
  @IsString()
  shipper?: string;

  @ApiPropertyOptional({ example: 'Warehouse B' })
  @IsOptional()
  @IsString()
  goDown?: string;

  @ApiPropertyOptional({ example: '2026-04-20T09:58:46.560Z' })
  @IsOptional()
  @IsDateString()
  dateOfLoading?: string;

  @ApiPropertyOptional({ example: '2026-04-19T09:58:46.560Z' })
  @IsOptional()
  @IsDateString()
  dateCheckWeight?: string;

  @ApiPropertyOptional({ example: 'Laem Chabang Port' })
  @IsOptional()
  @IsString()
  shippingPort?: string;

  @ApiPropertyOptional({ example: 'Vessel A123' })
  @IsOptional()
  @IsString()
  carryingVessel?: string;

  @ApiPropertyOptional({ example: 'Moisture < 14%' })
  @IsOptional()
  @IsString()
  qualityLine1?: string;

  @ApiPropertyOptional({ example: 'Broken < 5%' })
  @IsOptional()
  @IsString()
  qualityLine2?: string;

    @ApiPropertyOptional({ example: 'Broken < 5%' })
  @IsOptional()
  @IsString()
  packingLine1?: string;

  @ApiPropertyOptional({ example: 'Broken < 5%' })
  @IsOptional()
  @IsString()
  packingLine2?: string;
  
   @ApiPropertyOptional({ example: 'Broken < 5%' })
  @IsOptional()
  @IsString()
  packingLine3?: string;

  @ApiPropertyOptional({ example: '50000 KGS' })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({ example: 52000 })
  @IsOptional()
  @IsNumber()
  totalGrossWeight?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  totalTareWeight?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  totalNettWeight?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
