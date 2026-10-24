import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, PublicationStatus } from '@prisma/client';

export class CreateVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'OC-TI101-BLK-M' })
  @IsString()
  @IsNotEmpty()
  variantSku: string;

  @ApiProperty({ example: '890100101001' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 'Matte Onyx Black' })
  @IsString()
  @IsNotEmpty()
  colorName: string;

  @ApiProperty({ example: '#18181b' })
  @IsString()
  @IsNotEmpty()
  colorHex: string;

  @ApiProperty({ example: 'Medium (50-19-145)' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'Beta-Titanium' })
  @IsString()
  @IsNotEmpty()
  material: string;

  @ApiProperty({ example: 4999 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ example: 1950 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  initialStock?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];
}

export class CreateProductDto {
  @ApiProperty({ example: 'AeroLight Titanium Round' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'OcuSphere Signature' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Unisex' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ enum: ProductType, example: ProductType.Eyeglasses })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ example: 'Ultra-lightweight Japanese beta-titanium optical frames.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'OC-TI-101' })
  @IsString()
  @IsNotEmpty()
  modelCode: string;

  @ApiProperty({ example: 4999 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ enum: PublicationStatus, default: PublicationStatus.published })
  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f' })
  @IsString()
  @IsNotEmpty()
  featuredImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
