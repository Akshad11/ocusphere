import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Store Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Retrieve retail store information, business hours, and taxes (Public)' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSION_KEYS.STORE_SETTINGS)
  @ApiOperation({ summary: 'Update retail store operating parameters and policies' })
  updateSettings(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.settingsService.updateSettings(dto, actorName || 'Admin');
  }
}
