import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMERLOOK15' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number = 100;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  perCustomerLimit?: number = 1;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expiryDate: string;
}

export class CreateOfferDto {
  @ApiProperty({ example: 'Festive Eyewear Celebration' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '15% discount on complete frame and lens pairs.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Percentage', enum: ['Percentage', 'Fixed_Amount', 'Product_Specific', 'Category_Specific'] })
  @IsString()
  @IsNotEmpty()
  discountType: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  minimumPurchase: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  maximumDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicableCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicableProductId?: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: 500 })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({ type: [CreateCouponDto] })
  @IsOptional()
  @IsArray()
  coupons?: CreateCouponDto[];
}
