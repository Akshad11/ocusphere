import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ example: 'Pooja Sharma' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '9819876543' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({ example: 'pooja.sharma@yahoo.co.in' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ example: 'prod-001' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'var-001-1' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '2026-11-06' })
  @IsString()
  @IsNotEmpty()
  pickupDate: string;

  @ApiProperty({ example: 'Evening (05:00 PM - 08:00 PM)' })
  @IsString()
  @IsNotEmpty()
  pickupSlot: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
