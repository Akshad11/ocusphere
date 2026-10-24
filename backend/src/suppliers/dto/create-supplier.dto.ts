import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Luxottica India Eyewear Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Vikram Merchant' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+91 22 6789 0100' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'orders.india@luxottica.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'DLF Cyber City, Tower B, 7th Floor' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Gurugram' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Haryana' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '06AAACL1234F1Z1' })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiPropertyOptional({ example: 'Net 30', default: 'Net 30' })
  @IsOptional()
  @IsString()
  paymentTerms?: string = 'Net 30';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSupplierDto extends CreateSupplierDto {}
