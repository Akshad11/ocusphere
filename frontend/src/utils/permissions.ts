import { StaffRole, PermissionKey } from '../types/staff.types';

export const ROLE_DEFAULT_PERMISSIONS: Record<StaffRole, PermissionKey[]> = {
  'Owner/Admin': [
    'pos_access',
    'manage_products',
    'view_cost_price',
    'adjust_inventory',
    'approve_stock_requests',
    'manage_suppliers',
    'manage_purchase_orders',
    'manage_customers',
    'view_prescriptions',
    'manage_bookings',
    'manage_offers',
    'view_financial_reports',
    'manage_staff',
    'store_settings',
  ],
  'Store Manager': [
    'pos_access',
    'manage_products',
    'view_cost_price',
    'adjust_inventory',
    'approve_stock_requests',
    'manage_suppliers',
    'manage_purchase_orders',
    'manage_customers',
    'view_prescriptions',
    'manage_bookings',
    'manage_offers',
    'view_financial_reports',
  ],
  'Cashier': [
    'pos_access',
    'manage_customers',
    'manage_bookings',
  ],
  'Inventory Staff': [
    'manage_products',
    'adjust_inventory',
    'manage_suppliers',
    'manage_purchase_orders',
  ],
  'Store Assistant': [
    'manage_customers',
    'manage_bookings',
  ],
};

export function hasPermission(
  currentRole: StaffRole,
  userCustomPermissions: PermissionKey[] | undefined,
  requiredPermission: PermissionKey
): boolean {
  if (currentRole === 'Owner/Admin') return true;
  if (userCustomPermissions && userCustomPermissions.includes(requiredPermission)) {
    return true;
  }
  const defaultList = ROLE_DEFAULT_PERMISSIONS[currentRole] || [];
  return defaultList.includes(requiredPermission);
}
