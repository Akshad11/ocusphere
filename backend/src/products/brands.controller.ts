import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all optical brands' })
  async getBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Create new brand' })
  async createBrand(@Body() dto: CreateBrandDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }
}
