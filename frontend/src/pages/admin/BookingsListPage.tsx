import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { useBookings } from '../../hooks/useBookings';
import { DataTable, Column } from '../../components/common/DataTable';
import { Booking, BookingStatus, BookingType } from '../../types/booking.types';
import { BookingStatusBadge } from '../../components/bookings/BookingStatusBadge';
import { SearchInput } from '../../components/common/SearchInput';
import { formatDateTime } from '../../utils/dates';
import { Button } from '../../components/common/Button';
import { Calendar, Store, Eye, CheckCircle, Clock, Plus } from 'lucide-react';

export const BookingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'schedule'>('table');

  const { bookings, loading, updateStatus } = useBookings({
    search: search || undefined,
    type: typeFilter,
    status: statusFilter,
  });

  const columns: Column<Booking>[] = [
    {
      header: 'Reference',
      render: (b) => (
        <span className="font-mono font-bold text-neutral-900">{b.referenceNumber}</span>
      ),
    },
    {
      header: 'Type',
      render: (b) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-700">
          {b.bookingType === 'appointment' ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Clinical Exam</span>
            </>
          ) : (
            <>
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span>Product Hold</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (b) => (
        <div>
          <span className="font-semibold text-neutral-900 block">{b.customerName}</span>
          <span className="text-[11px] font-mono text-neutral-400">{b.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Slot / Hold Window',
      render: (b) => (
        <div className="text-xs">
          {b.bookingType === 'appointment' ? (
            <>
              <span className="font-medium text-neutral-900 block">{b.appointmentDate}</span>
              <span className="text-[11px] text-neutral-500 font-mono">{b.timeSlot}</span>
            </>
          ) : (
            <>
              <span className="text-neutral-700 block">
                {b.reservedItems?.length} frame(s) on hold
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Exp: {b.pickupWindowEnd?.split('T')[0]}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      render: (b) => <BookingStatusBadge status={b.status} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {b.status === 'Pending' && (
            <button
              onClick={() => updateStatus(b.id, 'Confirmed', 'Confirmed by front desk', 'Staff')}
              className="px-2 py-1 text-[11px] font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              Confirm
            </button>
          )}
          {b.status === 'Confirmed' && b.bookingType === 'appointment' && (
            <button
              onClick={() => updateStatus(b.id, 'Arrived', 'Patient checked in at reception', 'Front Desk')}
              className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Mark Arrived
            </button>
          )}
          {b.status === 'Preparing' && (
            <button
              onClick={() => updateStatus(b.id, 'Ready for pickup', 'Packaged at counter', 'Inventory')}
              className="px-2 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ready Pickup
            </button>
          )}
          {b.status === 'Ready for pickup' && (
            <button
              onClick={() => updateStatus(b.id, 'Collected', 'Customer collected frame', 'Cashier')}
              className="px-2 py-1 text-[11px] font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              Mark Collected
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/bookings/${b.id}`)}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Appointments & Product Reservations"
        subtitle="Manage optometric clinical appointments, trial sessions, and pickup holds."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-neutral-300 p-0.5 bg-white text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 font-medium rounded ${
                  viewMode === 'table' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-3 py-1 font-medium rounded ${
                  viewMode === 'schedule' ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600'
                }`}
              >
                Day Schedule
              </button>
            </div>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search reference, customer, or phone..."
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Booking Types</option>
            <option value="appointment">Clinical Appointments</option>
            <option value="reservation">Product Reservations</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Arrived">Arrived</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready for pickup">Ready for pickup</option>
            <option value="Collected">Collected</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={Array.isArray(bookings) ? bookings : []}
          keyExtractor={(b) => b.id}
          isLoading={loading}
          onRowClick={(b) => navigate(`/admin/bookings/${b.id}`)}
        />
      ) : (
        /* Schedule View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['Pending', 'Confirmed', 'Ready for pickup'] as const).map((colStatus) => {
            const bookingList = Array.isArray(bookings) ? bookings : [];
            const list = bookingList.filter((b) => b.status === colStatus);
            return (
              <div key={colStatus} className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    {colStatus} ({list.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {list.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      No bookings in {colStatus}
                    </div>
                  ) : (
                    list.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => navigate(`/admin/bookings/${b.id}`)}
                        className="p-3 bg-white border border-neutral-200 rounded-md shadow-2xs hover:border-neutral-400 cursor-pointer space-y-1.5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            {b.referenceNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">
                            {b.bookingType}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-neutral-900">{b.customerName}</h4>
                        <div className="text-[11px] text-neutral-500">
                          {b.bookingType === 'appointment'
                            ? `${b.appointmentDate} · ${b.timeSlot}`
                            : `${b.reservedItems?.[0]?.productName || 'Frame hold'}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
