import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoodsReceiptItemInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purchaseOrderItemId: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  receivedNow: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  damagedOrMissing?: number = 0;
}

export class CreateGoodsReceiptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purchaseOrderId: string;

  @ApiPropertyOptional({ example: 'DEL-INV-99212' })
  @IsOptional()
  @IsString()
  deliveryNoteNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [GoodsReceiptItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemInputDto)
  items: GoodsReceiptItemInputDto[];
}
