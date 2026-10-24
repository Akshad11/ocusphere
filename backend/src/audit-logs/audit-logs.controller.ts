import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';

@ApiTags('Audit Trail')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions(PERMISSION_KEYS.STORE_SETTINGS)
  @ApiOperation({ summary: 'Query immutable system audit logs' })
  findAll(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogsService.findAll({ entity, action });
  }
}
