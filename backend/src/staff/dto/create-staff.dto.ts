import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({ example: 'EMP-007' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Pooja Kashyap' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'pooja.kashyap@ocusphere.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9820077889' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.CASHIER })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiPropertyOptional({ example: 'OcuSphere@2026' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ type: [String], example: ['pos_access', 'manage_customers'] })
  @IsOptional()
  customPermissions?: string[];
}
