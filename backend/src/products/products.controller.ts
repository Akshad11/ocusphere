import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Product Catalogue')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List and filter optical products (Public & Storefront accessible)' })
  @ApiResponse({ status: 200, description: 'Paginated product catalogue' })
  findAll(@Query() query: ProductQueryDto, @CurrentUser() user?: any) {
    return this.productsService.list(query, user);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Retrieve product details by SEO slug' })
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: any) {
    return this.productsService.getBySlug(slug, user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve product details by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.productsService.getById(id, user);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Create a new optical product and variants' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.productsService.create(createProductDto, actorName);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Update product details and pricing' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.productsService.update(id, updateProductDto, actorName);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PRODUCTS)
  @ApiOperation({ summary: 'Delete or archive a product' })
  remove(@Param('id') id: string, @CurrentUser('fullName') actorName: string) {
    return this.productsService.delete(id, actorName);
  }
}
