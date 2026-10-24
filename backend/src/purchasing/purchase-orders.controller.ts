import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasingService } from './purchasing.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'List all vendor purchase orders' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.purchasingService.listPurchaseOrders({ search, status });
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'Retrieve specific purchase order with line items' })
  findOne(@Param('id') id: string) {
    return this.purchasingService.getPurchaseOrder(id);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'Create a new purchase order' })
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser('fullName') createdBy: string,
  ) {
    return this.purchasingService.createPurchaseOrder(dto, createdBy || 'Procurement');
  }

  @Post(':id/submit')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_PURCHASE_ORDERS)
  @ApiOperation({ summary: 'Submit purchase order to supplier' })
  submit(
    @Param('id') id: string,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.purchasingService.submitPurchaseOrder(id, actorName || 'Procurement');
  }
}
