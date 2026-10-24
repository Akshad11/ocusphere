import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { ValidateCouponDto, RedeemCouponDto } from './dto/validate-coupon.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';

@ApiTags('Coupons & Redemptions')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_OFFERS)
  @ApiOperation({ summary: 'List all promotional coupon codes and usage counters' })
  findAll() {
    return this.offersService.listCoupons();
  }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon eligibility and calculate authoritative discount' })
  validate(@Body() dto: ValidateCouponDto) {
    return this.offersService.validateCoupon(dto);
  }

  @Post('redeem')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.POS_ACCESS)
  @ApiOperation({ summary: 'Redeem coupon and record transaction usage' })
  redeem(@Body() dto: RedeemCouponDto) {
    return this.offersService.redeemCoupon(dto);
  }
}
