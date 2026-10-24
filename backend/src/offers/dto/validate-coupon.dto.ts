import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({ example: 'FESTIVE15' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 4999 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: '9820123456' })
  @IsOptional()
  @IsString()
  customerPhone?: string;
}

export class RedeemCouponDto extends ValidateCouponDto {
  @ApiPropertyOptional({ example: 'sale-12345' })
  @IsOptional()
  @IsString()
  saleId?: string;
}
