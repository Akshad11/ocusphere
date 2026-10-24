import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: '12 Hill Road' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '400050' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string = 'India';
}

export class ContactPreferencesDto {
  @IsBoolean()
  @IsOptional()
  sms?: boolean = true;

  @IsBoolean()
  @IsOptional()
  whatsapp?: boolean = true;

  @IsBoolean()
  @IsOptional()
  email?: boolean = false;

  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean = true;
}

export class CreateCustomerDto {
  @ApiProperty({ example: 'Aarav' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Mehta' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'aarav.mehta@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '9820123456' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '1992-05-14' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: ContactPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactPreferencesDto)
  contactPreferences?: ContactPreferencesDto;
}
