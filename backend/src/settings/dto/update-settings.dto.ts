import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  openingHours?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bookingCapacityPerHour?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  reservationHoldDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxRatePercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptHeader?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptFooter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableSmsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableWhatsappNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableEmailNotifications?: boolean;
}
