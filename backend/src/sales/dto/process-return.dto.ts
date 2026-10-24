import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class ReturnItemInputDto {
  @ApiProperty({ example: 'sale-item-01' })
  @IsString()
  @IsNotEmpty()
  saleItemId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  returnedQuantity: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  restockStock?: boolean = true;

  @ApiProperty({ example: 'Fitting Issue' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ProcessReturnDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.Cash })
  @IsEnum(PaymentMethod)
  refundMethod: PaymentMethod;

  @ApiProperty({ type: [ReturnItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemInputDto)
  items: ReturnItemInputDto[];
}
