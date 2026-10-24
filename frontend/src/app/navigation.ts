/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Calendar,
  Users,
  Glasses,
  Boxes,
  Truck,
  FileSpreadsheet,
  Tag,
  BarChart3,
  Bell,
  Shield,
  Settings,
  History,
  Building2,
} from 'lucide-react';
import { ROUTE_PATHS } from './routeConfig';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core Operations',
    items: [
      { label: 'Executive Dashboard', path: ROUTE_PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
      { label: 'Point of Sale (POS)', path: ROUTE_PATHS.ADMIN_POS, icon: ShoppingCart },
      { label: 'Sales & Receipts', path: ROUTE_PATHS.ADMIN_SALES, icon: Receipt },
      { label: 'Returns & Refunds', path: ROUTE_PATHS.ADMIN_RETURNS, icon: RotateCcw },
    ],
  },
  {
    title: 'Clinical & Customer',
    items: [
      { label: 'Appointments & Pickups', path: ROUTE_PATHS.ADMIN_BOOKINGS, icon: Calendar },
      { label: 'Customer Prescriptions', path: ROUTE_PATHS.ADMIN_CUSTOMERS, icon: Users },
    ],
  },
  {
    title: 'Catalogue & Inventory',
    items: [
      { label: 'Eyewear Products Master', path: ROUTE_PATHS.ADMIN_PRODUCTS, icon: Glasses },
      { label: 'Stock Balances', path: ROUTE_PATHS.ADMIN_INVENTORY, icon: Boxes },
      { label: 'Stock Log', path: ROUTE_PATHS.ADMIN_STOCK_MOVEMENTS, icon: History },
      { label: 'Physical Stocktakes', path: ROUTE_PATHS.ADMIN_STOCKTAKES, icon: FileSpreadsheet },
      { label: 'Stock Requisitions', path: ROUTE_PATHS.ADMIN_STOCK_REQUESTS, icon: RotateCcw },
    ],
  },
  {
    title: 'Procurement & Vendors',
    items: [
      { label: 'Suppliers Directory', path: ROUTE_PATHS.ADMIN_SUPPLIERS, icon: Building2 },
      { label: 'Purchase Orders', path: ROUTE_PATHS.ADMIN_PURCHASE_ORDERS, icon: Truck },
      { label: 'Goods Receipts (GRN)', path: ROUTE_PATHS.ADMIN_GOODS_RECEIPTS, icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Marketing & Loyalty',
    items: [
      { label: 'Campaigns & Offers', path: ROUTE_PATHS.ADMIN_OFFERS, icon: Tag },
      { label: 'Coupons & Vouchers', path: ROUTE_PATHS.ADMIN_COUPONS, icon: Tag },
    ],
  },
  {
    title: 'Analytics & Admin',
    items: [
      { label: 'Reports & Revenue', path: ROUTE_PATHS.ADMIN_REPORTS, icon: BarChart3 },
      { label: 'System Notifications', path: ROUTE_PATHS.ADMIN_NOTIFICATIONS, icon: Bell },
      { label: 'Staff Management', path: ROUTE_PATHS.ADMIN_STAFF, icon: Shield },
      { label: 'Roles & Permissions', path: ROUTE_PATHS.ADMIN_ROLES_PERMISSIONS, icon: Shield },
      { label: 'Store Configuration', path: ROUTE_PATHS.ADMIN_STORE_SETTINGS, icon: Settings },
      { label: 'Security Audit Logs', path: ROUTE_PATHS.ADMIN_AUDIT_LOGS, icon: History },
    ],
  },
];
