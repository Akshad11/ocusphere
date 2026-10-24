import { StaffMember, RoleDefinition } from '../types/staff.types';
import { ROLE_DEFAULT_PERMISSIONS } from '../utils/permissions';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-001',
    employeeCode: 'EMP-001',
    fullName: 'Rajiv Singhal',
    email: 'rajiv.singhal@ocusphere.in',
    phone: '9820011223',
    role: 'Owner/Admin',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Owner/Admin'],
    joinedDate: '2024-01-01',
    lastLogin: '2026-10-24T08:15:00Z',
  },
  {
    id: 'staff-002',
    employeeCode: 'EMP-002',
    fullName: 'Kavita Joshi',
    email: 'kavita.joshi@ocusphere.in',
    phone: '9820022334',
    role: 'Store Manager',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Store Manager'],
    joinedDate: '2024-03-15',
    lastLogin: '2026-10-24T09:00:00Z',
  },
  {
    id: 'staff-003',
    employeeCode: 'EMP-003',
    fullName: 'Aman Patel',
    email: 'aman.patel@ocusphere.in',
    phone: '9820033445',
    role: 'Cashier',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Cashier'],
    joinedDate: '2024-08-01',
    lastLogin: '2026-10-24T09:30:00Z',
  },
  {
    id: 'staff-004',
    employeeCode: 'EMP-004',
    fullName: 'Karan Sharma',
    email: 'karan.sharma@ocusphere.in',
    phone: '9820044556',
    role: 'Inventory Staff',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Inventory Staff'],
    joinedDate: '2024-09-10',
    lastLogin: '2026-10-24T08:45:00Z',
  },
  {
    id: 'staff-005',
    employeeCode: 'EMP-005',
    fullName: 'Simran Walia',
    email: 'simran.walia@ocusphere.in',
    phone: '9820055667',
    role: 'Store Assistant',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Store Assistant'],
    joinedDate: '2025-01-15',
    lastLogin: '2026-10-24T10:00:00Z',
  },
  {
    id: 'staff-006',
    employeeCode: 'EMP-006',
    fullName: 'Dr. Neha Kulkarni, M.Optom',
    email: 'dr.neha@ocusphere.in',
    phone: '9820066778',
    role: 'Store Manager',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['Store Manager'],
    joinedDate: '2024-02-01',
    lastLogin: '2026-10-24T09:15:00Z',
  }
];

export const INITIAL_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'Owner/Admin',
    description: 'Full unconstrained operational, financial, pricing, and system configuration authority.',
    defaultPermissions: ROLE_DEFAULT_PERMISSIONS['Owner/Admin'],
  },
  {
    role: 'Store Manager',
    description: 'Day-to-day retail operations, product catalogue, discount approvals, and inventory control.',
    defaultPermissions: ROLE_DEFAULT_PERMISSIONS['Store Manager'],
  },
  {
    role: 'Cashier',
    description: 'Point of sale billing, receipt issuance, customer registrations, and payments.',
    defaultPermissions: ROLE_DEFAULT_PERMISSIONS['Cashier'],
  },
  {
    role: 'Inventory Staff',
    description: 'Stock inward receiving, adjustments, shelf transfers, and purchase order tracking.',
    defaultPermissions: ROLE_DEFAULT_PERMISSIONS['Inventory Staff'],
  },
  {
    role: 'Store Assistant',
    description: 'Floor styling assistance, customer check-in, and pickup fulfillment.',
    defaultPermissions: ROLE_DEFAULT_PERMISSIONS['Store Assistant'],
  }
];
