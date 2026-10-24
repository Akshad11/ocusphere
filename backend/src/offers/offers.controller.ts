import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Marketing Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active customer promotions (Public & Storefront accessible)' })
  findAll(@Query('activeOnly') activeOnly?: boolean) {
    return this.offersService.listOffers(activeOnly === true || String(activeOnly) === 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve promotional campaign details' })
  findOne(@Param('id') id: string) {
    return this.offersService.getOffer(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_OFFERS)
  @ApiOperation({ summary: 'Create a new promotional campaign and coupons' })
  create(
    @Body() dto: CreateOfferDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.offersService.createOffer(dto, actorName || 'Marketing');
  }
}
