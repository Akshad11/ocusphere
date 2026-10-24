import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { CreateStockRequestDto } from './dto/stock-request.dto';
import { CreateStocktakeDto, CompleteStocktakeDto } from './dto/stocktake.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Inventory Management')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Retrieve authoritative stock balances and reorder alerts' })
  getBalances(
    @Query('search') search?: string,
    @Query('lowStockOnly') lowStockOnly?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.inventoryService.getBalances({
      search,
      lowStockOnly: lowStockOnly === true || String(lowStockOnly) === 'true',
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get('movements')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Query complete immutable stock movement ledger' })
  getMovements(
    @Query('variantId') variantId?: string,
    @Query('movementType') movementType?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.inventoryService.getMovements({
      variantId,
      movementType,
      search,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
    });
  }

  @Get('counts')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'List physical stocktake sessions' })
  listStocktakes() {
    return this.inventoryService.listStocktakes();
  }

  @Post('counts')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Initialize a new cycle count / stocktake session' })
  createStocktake(
    @Body() dto: CreateStocktakeDto,
    @CurrentUser('fullName') auditor: string,
  ) {
    return this.inventoryService.createStocktake(dto, auditor || 'Inventory Staff');
  }

  @Post('counts/:id/complete')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Finalize stocktake and optionally reconcile variances' })
  completeStocktake(
    @Param('id') id: string,
    @Body() dto: CompleteStocktakeDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.inventoryService.completeStocktake(id, dto, actorName || 'Manager');
  }

  @Get('requests')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'List branch stock replenishment requests' })
  listStockRequests() {
    return this.inventoryService.listStockRequests();
  }

  @Post('requests')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Submit stock replenishment request' })
  createStockRequest(
    @Body() dto: CreateStockRequestDto,
    @CurrentUser('fullName') requestedBy: string,
  ) {
    return this.inventoryService.createStockRequest(dto, requestedBy || 'Staff');
  }

  @Patch('requests/:id/approve')
  @RequirePermissions(PERMISSION_KEYS.APPROVE_STOCK_REQUESTS)
  @ApiOperation({ summary: 'Approve stock replenishment request' })
  approveStockRequest(
    @Param('id') id: string,
    @CurrentUser('fullName') approvedBy: string,
    @Body('notes') notes?: string,
  ) {
    return this.inventoryService.approveStockRequest(id, approvedBy || 'Manager', notes);
  }

  @Post('adjustments')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Perform manual inventory adjustment with mandatory audit reason' })
  adjustStock(
    @Body() dto: StockAdjustmentDto,
    @CurrentUser('fullName') performedBy: string,
  ) {
    return this.inventoryService.adjustStock(dto, performedBy || 'Store Staff');
  }

  @Get(':productVariantId')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Retrieve stock balance for a specific variant' })
  getVariantBalance(@Param('productVariantId') variantId: string) {
    return this.inventoryService.getVariantBalance(variantId);
  }
}
