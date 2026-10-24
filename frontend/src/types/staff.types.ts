export type StaffRole =
  | 'Owner/Admin'
  | 'Store Manager'
  | 'Cashier'
  | 'Inventory Staff'
  | 'Store Assistant';

export type PermissionKey =
  | 'pos_access'
  | 'manage_products'
  | 'view_cost_price'
  | 'adjust_inventory'
  | 'approve_stock_requests'
  | 'manage_suppliers'
  | 'manage_purchase_orders'
  | 'manage_customers'
  | 'view_prescriptions'
  | 'manage_bookings'
  | 'manage_offers'
  | 'view_financial_reports'
  | 'manage_staff'
  | 'store_settings';

export interface StaffMember {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  permissions: PermissionKey[];
  avatarUrl?: string;
  joinedDate: string;
  lastLogin: string;
}

export interface RoleDefinition {
  role: StaffRole;
  description: string;
  defaultPermissions: PermissionKey[];
}
