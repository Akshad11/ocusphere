import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('POS & Retail Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'List sales records with status and search filters' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('date') date?: string,
  ) {
    return this.salesService.findAll({ search, status, paymentMethod, date });
  }

  @Get('returns')
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'List all processed return transactions' })
  listReturns() {
    return this.salesService.listReturns();
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'Retrieve sale and invoice details' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get(':id/receipt')
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'Generate printable tax invoice receipt payload' })
  getReceipt(@Param('id') id: string) {
    return this.salesService.getReceipt(id);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'Process POS billing checkout and update inventory' })
  createSale(
    @Body() dto: CreateSaleDto,
    @CurrentUser('fullName') cashierName: string,
  ) {
    return this.salesService.createSale(dto, cashierName || 'Cashier');
  }

  @Post(':id/returns')
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'Process customer returns, refund, and optional inventory restock' })
  processReturn(
    @Param('id') id: string,
    @Body() dto: ProcessReturnDto,
    @CurrentUser('fullName') processedBy: string,
  ) {
    return this.salesService.processReturn(id, dto, processedBy || 'Store Staff');
  }
}
