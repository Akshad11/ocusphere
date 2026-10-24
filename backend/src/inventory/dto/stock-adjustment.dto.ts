import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdjustmentType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export enum AdjustmentReason {
  DAMAGED = 'Damaged',
  CYCLE_COUNT = 'Cycle Count Discrepancy',
  STORE_SAMPLE = 'Store Sample',
  CUSTOMER_RETURN = 'Customer Return',
  SUPPLIER_CORRECTION = 'Supplier Correction',
  OTHER = 'Other',
}

export class StockAdjustmentDto {
  @ApiProperty({ example: 'var-001-1' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ enum: AdjustmentType, example: AdjustmentType.ADD })
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ enum: AdjustmentReason, example: AdjustmentReason.CYCLE_COUNT })
  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @ApiPropertyOptional({ example: 'Audited during weekly physical inventory check' })
  @IsOptional()
  @IsString()
  notes?: string;
}
