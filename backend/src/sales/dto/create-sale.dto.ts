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
import { PaymentMethod } from '@prisma/client';

export class SaleItemInputDto {
  @ApiProperty({ example: 'var-001-1' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  itemDiscount?: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'cust-001' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Aarav Mehta' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '9820123456' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'aarav.mehta@gmail.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ type: [SaleItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemInputDto)
  items: SaleItemInputDto[];

  @ApiPropertyOptional({ example: 'FESTIVE15' })
  @IsOptional()
  @IsString()
  appliedCoupon?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.Cash })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  amountReceived?: number;

  @ApiPropertyOptional({ example: 'UPI-REF-998822' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Customer wants hard shell frame case' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'idem-sale-17290001' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
