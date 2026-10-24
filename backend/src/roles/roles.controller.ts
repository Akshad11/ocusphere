import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffRole } from '@prisma/client';
import { ROLE_DEFAULT_PERMISSIONS, PERMISSION_KEYS } from '../common/constants/permissions.constant';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  @Get()
  @ApiOperation({ summary: 'List standard role definitions and permission capabilities' })
  getRoles() {
    const roleDefinitions = [
      {
        role: 'Owner/Admin',
        systemRole: StaffRole.OWNER_ADMIN,
        description: 'Full unconstrained operational, financial, pricing, and system configuration authority.',
        defaultPermissions: ROLE_DEFAULT_PERMISSIONS[StaffRole.OWNER_ADMIN],
      },
      {
        role: 'Store Manager',
        systemRole: StaffRole.STORE_MANAGER,
        description: 'Day-to-day retail operations, product catalogue, discount approvals, and inventory control.',
        defaultPermissions: ROLE_DEFAULT_PERMISSIONS[StaffRole.STORE_MANAGER],
      },
      {
        role: 'Cashier',
        systemRole: StaffRole.CASHIER,
        description: 'Point of sale billing, receipt issuance, customer registrations, and payments.',
        defaultPermissions: ROLE_DEFAULT_PERMISSIONS[StaffRole.CASHIER],
      },
      {
        role: 'Inventory Staff',
        systemRole: StaffRole.INVENTORY_STAFF,
        description: 'Stock inward receiving, adjustments, shelf transfers, and purchase order tracking.',
        defaultPermissions: ROLE_DEFAULT_PERMISSIONS[StaffRole.INVENTORY_STAFF],
      },
      {
        role: 'Store Assistant',
        systemRole: StaffRole.STORE_ASSISTANT,
        description: 'Floor styling assistance, customer check-in, and pickup fulfillment.',
        defaultPermissions: ROLE_DEFAULT_PERMISSIONS[StaffRole.STORE_ASSISTANT],
      },
    ];

    return {
      roles: roleDefinitions,
      allPermissions: Object.values(PERMISSION_KEYS),
    };
  }
}
