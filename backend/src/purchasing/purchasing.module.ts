import { Module } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { GoodsReceiptsController } from './goods-receipts.controller';

@Module({
  controllers: [PurchaseOrdersController, GoodsReceiptsController],
  providers: [PurchasingService],
  exports: [PurchasingService],
})
export class PurchasingModule {}
