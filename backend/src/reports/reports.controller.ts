import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSION_KEYS } from '../common/constants/permissions.constant';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions(PERMISSION_KEYS.VIEW_FINANCIAL_REPORTS)
  @ApiOperation({ summary: 'Retrieve high-level executive retail KPIs and valuation metrics' })
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('sales')
  @RequirePermissions(PERMISSION_KEYS.VIEW_FINANCIAL_REPORTS)
  @ApiOperation({ summary: 'Retrieve aggregate sales analysis and payment method breakdown' })
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport({ startDate, endDate });
  }

  @Get('inventory')
  @RequirePermissions(PERMISSION_KEYS.ADJUST_INVENTORY)
  @ApiOperation({ summary: 'Retrieve stock valuation and critical low-stock items' })
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }
}
