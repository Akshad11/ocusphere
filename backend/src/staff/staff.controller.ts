import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Staff & Users')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_STAFF)
  @ApiOperation({ summary: 'List all staff members and their active roles' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_STAFF)
  @ApiOperation({ summary: 'Retrieve specific staff member profile' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSION_KEYS.MANAGE_STAFF)
  @ApiOperation({ summary: 'Create and onboard a new staff member' })
  create(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.staffService.create(createStaffDto, actorName);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_STAFF)
  @ApiOperation({ summary: 'Update staff member profile, role, or permissions' })
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUser('fullName') actorName: string,
  ) {
    return this.staffService.update(id, updateStaffDto, actorName);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSION_KEYS.MANAGE_STAFF)
  @ApiOperation({ summary: 'Deactivate a staff member account' })
  remove(@Param('id') id: string, @CurrentUser('fullName') actorName: string) {
    return this.staffService.remove(id, actorName);
  }
}
