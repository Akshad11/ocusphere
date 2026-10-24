import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockRequestItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  requestedQuantity: number;

  @ApiPropertyOptional({ example: 1950 })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}

export class CreateStockRequestDto {
  @ApiPropertyOptional({ enum: ['Standard', 'Urgent', 'Critical'], default: 'Standard' })
  @IsOptional()
  @IsString()
  urgency?: string = 'Standard';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockRequestItemDto)
  items: StockRequestItemDto[];
}
