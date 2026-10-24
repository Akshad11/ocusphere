import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_BOOKINGS)
  @ApiOperation({ summary: 'List customer SMS, WhatsApp and email logs' })
  findAll(
    @Query('channel') channel?: string,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.list({ channel, type });
  }

  @Post(':id/retry')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_BOOKINGS)
  @ApiOperation({ summary: 'Retry queued or failed notification' })
  retry(@Param('id') id: string) {
    return this.notificationsService.retry(id);
  }
}
