import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ProductListingPage } from '../pages/public/ProductListingPage';
import { ProductDetailsPage } from '../pages/public/ProductDetailsPage';
import { OffersPage } from '../pages/public/OffersPage';
import { StorePage } from '../pages/public/StorePage';
import { ContactPage } from '../pages/public/ContactPage';
import { AppointmentBookingPage } from '../pages/public/AppointmentBookingPage';
import { ProductReservationPage } from '../pages/public/ProductReservationPage';
import { BookingConfirmationPage } from '../pages/public/BookingConfirmationPage';
import { BookingLookupPage } from '../pages/public/BookingLookupPage';
import { TermsPage, PrivacyPage } from '../pages/public/PolicyPages';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage';
import { POSPage } from '../pages/admin/POSPage';
import { SalesListPage } from '../pages/admin/SalesListPage';
import { SaleDetailsPage } from '../pages/admin/SaleDetailsPage';
import { ReturnsPage } from '../pages/admin/ReturnsPage';
import { BookingsListPage } from '../pages/admin/BookingsListPage';
import { BookingDetailsPage } from '../pages/admin/BookingDetailsPage';
import { CustomersListPage } from '../pages/admin/CustomersListPage';
import { CustomerDetailsPage } from '../pages/admin/CustomerDetailsPage';
import { ProductsListPage } from '../pages/admin/ProductsListPage';
import { ProductCreateEditPage } from '../pages/admin/ProductCreateEditPage';
import { ProductDetailsAdminPage } from '../pages/admin/ProductDetailsAdminPage';
import { InventoryPage } from '../pages/admin/InventoryPage';
import { StockMovementsPage } from '../pages/admin/StockMovementsPage';
import { StocktakesPage } from '../pages/admin/StocktakesPage';
import { StockRequestsPage } from '../pages/admin/StockRequestsPage';
import { SuppliersPage } from '../pages/admin/SuppliersPage';
import { SupplierDetailsPage } from '../pages/admin/SupplierDetailsPage';
import { PurchaseOrdersPage } from '../pages/admin/PurchaseOrdersPage';
import { PurchaseOrderDetailsPage } from '../pages/admin/PurchaseOrderDetailsPage';
import { GoodsReceiptsPage } from '../pages/admin/GoodsReceiptsPage';
import { OffersManagementPage } from '../pages/admin/OffersManagementPage';
import { CouponsPage } from '../pages/admin/CouponsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { StaffManagementPage } from '../pages/admin/StaffManagementPage';
import { RolesPermissionsPage } from '../pages/admin/RolesPermissionsPage';
import { StoreSettingsPage } from '../pages/admin/StoreSettingsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const MockUiRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer-Facing Public Experience */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/products/slug/:slug" element={<ProductDetailsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/book/appointment" element={<AppointmentBookingPage />} />
        <Route path="/book/reservation" element={<ProductReservationPage />} />
        <Route path="/book/confirmation" element={<BookingConfirmationPage />} />
        <Route path="/book/lookup" element={<BookingLookupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* Admin Retail ERP & Point of Sale Experience */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="sales" element={<SalesListPage />} />
        <Route path="sales/:id" element={<SaleDetailsPage />} />
        <Route path="sales/returns" element={<ReturnsPage />} />
        <Route path="returns" element={<ReturnsPage />} />

        {/* Bookings */}
        <Route path="bookings" element={<BookingsListPage />} />
        <Route path="bookings/:id" element={<BookingDetailsPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersListPage />} />
        <Route path="customers/:id" element={<CustomerDetailsPage />} />

        {/* Catalogue */}
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductCreateEditPage />} />
        <Route path="products/:id/edit" element={<ProductCreateEditPage />} />
        <Route path="products/:id" element={<ProductDetailsAdminPage />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/movements" element={<StockMovementsPage />} />
        <Route path="inventory/stocktakes" element={<StocktakesPage />} />
        <Route path="inventory/counts" element={<StocktakesPage />} />
        <Route path="inventory/requests" element={<StockRequestsPage />} />
        <Route path="stock-requests" element={<StockRequestsPage />} />

        {/* Purchasing & Vendors */}
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="purchasing/orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchasing/orders/:id" element={<PurchaseOrderDetailsPage />} />
        <Route path="purchasing/receipts" element={<GoodsReceiptsPage />} />
        <Route path="goods-receipts" element={<GoodsReceiptsPage />} />

        {/* Marketing */}
        <Route path="marketing/offers" element={<OffersManagementPage />} />
        <Route path="offers" element={<OffersManagementPage />} />
        <Route path="marketing/coupons" element={<CouponsPage />} />
        <Route path="coupons" element={<CouponsPage />} />

        {/* Reports & Management */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="staff/roles" element={<RolesPermissionsPage />} />
        <Route path="roles" element={<RolesPermissionsPage />} />
        <Route path="settings" element={<StoreSettingsPage />} />
        <Route path="settings/audit" element={<AuditLogsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
