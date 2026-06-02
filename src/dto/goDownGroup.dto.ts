import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGoDownGroupDto {
  @ApiProperty({ example: 'Group A', required: false })
  @IsString()
  @IsOptional()
  goDownGroupName?: string;

  @ApiProperty({ example: '#FF5733', required: false })
  @IsString()
  @IsOptional()
  goDownColor?: string;
}

export class UpdateGoDownGroupDto {
  @ApiProperty({ example: 'Group A', required: false })
  @IsString()
  @IsOptional()
  goDownGroupName?: string;

  @ApiProperty({ example: '#FF5733', required: false })
  @IsString()
  @IsOptional()
  goDownColor?: string;
}
