import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StocktakeItemInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @Min(0)
  countedStock: number;
}

export class CreateStocktakeDto {
  @ApiProperty({ example: 'Frames - Beta Titanium' })
  @IsString()
  @IsNotEmpty()
  categoryOrBrand: string;

  @ApiProperty({ type: [StocktakeItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StocktakeItemInputDto)
  items: StocktakeItemInputDto[];
}

export class CompleteStocktakeDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  reconcileInventory?: boolean;
}
