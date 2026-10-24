import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasingService } from './purchasing.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Goods Receipts')
@ApiBearerAuth()
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'List all processed warehouse goods receipts' })
  findAll() {
    return this.purchasingService.listGoodsReceipts();
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'Retrieve specific goods receipt with line items' })
  findOne(@Param('id') id: string) {
    return this.purchasingService.getGoodsReceipt(id);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'Process incoming shipment receipt and update inventory balances' })
  create(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser('fullName') receivedBy: string,
  ) {
    return this.purchasingService.createGoodsReceipt(dto, receivedBy || 'Inventory Staff');
  }
}
