import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { CouponsController } from './coupons.controller';

@Module({
  controllers: [OffersController, CouponsController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
