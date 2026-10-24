import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Suppliers & Vendors')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_SUPPLIERS)
  @ApiOperation({ summary: 'List all optical vendors and lens laboratories' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_SUPPLIERS)
  @ApiOperation({ summary: 'Retrieve supplier details and recent purchase orders' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_SUPPLIERS)
  @ApiOperation({ summary: 'Register a new supplier or optical vendor' })
  create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.suppliersService.create(dto, actorName || 'Procurement');
  }

  @Patch(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_SUPPLIERS)
  @ApiOperation({ summary: 'Update supplier details or payment terms' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.suppliersService.update(id, dto, actorName || 'Procurement');
  }
}
