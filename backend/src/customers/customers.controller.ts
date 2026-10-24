import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers & Prescriptions')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Paginated customer list (Prescriptions excluded for privacy)' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.customersService.findAll({
      search,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Retrieve customer CRM profile (Includes Rx if authorized)' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(id, user);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Register a new store customer' })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.customersService.create(createCustomerDto, actorName || 'Cashier');
  }

  @Patch(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Update customer contact information' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.customersService.update(id, updateCustomerDto, actorName || 'Cashier');
  }

  @Get(':id/sales')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Retrieve retail sales history for customer' })
  getCustomerSales(@Param('id') id: string) {
    return this.customersService.getCustomerSales(id);
  }

  @Get(':id/bookings')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_CUSTOMERS)
  @ApiOperation({ summary: 'Retrieve appointment and reservation history for customer' })
  getCustomerBookings(@Param('id') id: string) {
    return this.customersService.getCustomerBookings(id);
  }

  @Post(':id/prescriptions')
  @RequirePermissions(PERMISSION_KEYS.VIEW_PRESCRIPTIONS)
  @ApiOperation({ summary: 'Record optometrist eye test prescription for customer' })
  addPrescription(
    @Param('id') id: string,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.addPrescription(id, dto, user);
  }
}
