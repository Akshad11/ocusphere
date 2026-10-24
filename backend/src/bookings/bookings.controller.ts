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
import { BookingsService } from './bookings.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Bookings & In-Store Reservations')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post('bookings/appointments')
  @ApiOperation({ summary: 'Schedule an in-store optometry eye examination (Storefront Public)' })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.bookingsService.createAppointment(dto);
  }

  @Public()
  @Post('reservations')
  @ApiOperation({ summary: 'Place a physical stock hold for in-store eyewear trial (Storefront Public)' })
  createReservation(@Body() dto: CreateReservationDto) {
    return this.bookingsService.createReservation(dto);
  }

  @Public()
  @Get('bookings/lookup')
  @ApiOperation({ summary: 'Secure public booking lookup by reference and matching phone number' })
  lookup(
    @Query('referenceNumber') referenceNumber: string,
    @Query('phone') phone: string,
  ) {
    return this.bookingsService.lookup(referenceNumber, phone);
  }

  @Public()
  @Post('reservations/:id/cancel')
  @ApiOperation({ summary: 'Cancel reservation and release reserved inventory' })
  cancelReservation(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelReservation(id, reason);
  }

  @Get('bookings')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_BOOKINGS)
  @ApiOperation({ summary: 'List all appointments and product reservations' })
  findAll(
    @Query('bookingType') bookingType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('date') date?: string,
  ) {
    return this.bookingsService.findAll({
      bookingType,
      status,
      search,
      date,
    });
  }

  @Get('bookings/:id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_BOOKINGS)
  @ApiOperation({ summary: 'Retrieve booking details by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch('bookings/:id/status')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_BOOKINGS)
  @ApiOperation({ summary: 'Update appointment or reservation status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.bookingsService.updateStatus(id, dto, actorName || 'Staff');
  }
}
