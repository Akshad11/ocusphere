import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Aarav Mehta' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '9820123456' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({ example: 'aarav.mehta@gmail.com' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ example: 'Comprehensive Eye Exam' })
  @IsString()
  @IsNotEmpty()
  appointmentPurpose: string;

  @ApiProperty({ example: '2026-11-05' })
  @IsString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ example: '11:00 AM - 11:45 AM' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiPropertyOptional({ example: 'Frequent headache after 4 hours on laptop' })
  @IsOptional()
  @IsString()
  notes?: string;
}
