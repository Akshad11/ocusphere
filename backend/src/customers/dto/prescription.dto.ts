import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'Dr. Neha Kulkarni, M.Optom' })
  @IsString()
  @IsNotEmpty()
  optometristName: string;

  @ApiProperty({ example: 'Bandra West Flagship' })
  @IsString()
  @IsNotEmpty()
  clinicOrBranch: string;

  @ApiProperty({ example: '-1.75' })
  @IsString()
  @IsNotEmpty()
  rightSph: string;

  @ApiProperty({ example: '-0.50' })
  @IsString()
  @IsNotEmpty()
  rightCyl: string;

  @ApiProperty({ example: '180' })
  @IsString()
  @IsNotEmpty()
  rightAxis: string;

  @ApiPropertyOptional({ example: '+1.75' })
  @IsOptional()
  @IsString()
  rightAdd?: string;

  @ApiProperty({ example: '-2.00' })
  @IsString()
  @IsNotEmpty()
  leftSph: string;

  @ApiProperty({ example: '-0.75' })
  @IsString()
  @IsNotEmpty()
  leftCyl: string;

  @ApiProperty({ example: '175' })
  @IsString()
  @IsNotEmpty()
  leftAxis: string;

  @ApiPropertyOptional({ example: '+1.75' })
  @IsOptional()
  @IsString()
  leftAdd?: string;

  @ApiProperty({ example: 63.5 })
  @IsNumber()
  pupillaryDistance: number;

  @ApiPropertyOptional({ example: 60.0 })
  @IsOptional()
  @IsNumber()
  nearPd?: number;

  @ApiPropertyOptional({ example: 'Zeiss ClearView 1.60 Single Vision' })
  @IsOptional()
  @IsString()
  lensTypeRecommended?: string;

  @ApiPropertyOptional({ example: 'DuraVision Platinum AR' })
  @IsOptional()
  @IsString()
  coatingRecommended?: string;

  @ApiPropertyOptional({ example: 'Subjective refraction confirmed. Mild astigmatism.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
