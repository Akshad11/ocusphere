import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'rajiv.singhal@ocusphere.in' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'OcuSphere@2026' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password: string;
}
