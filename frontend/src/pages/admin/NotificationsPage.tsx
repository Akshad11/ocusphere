import React, { useState } from 'react';
import { Bell, RefreshCw, Trash2, AlertTriangle, Calendar, ShoppingBag, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/dates';
import { NotificationChannel, NotificationLog } from '../../types/notification.types';

export const NotificationsPage: React.FC = () => {
  const { notifications, loading, refresh, retry, deleteNotification } = useNotifications();
  const [filterChannel, setFilterChannel] = useState<'all' | NotificationChannel>('all');

  const notifList = Array.isArray(notifications) ? notifications : [];
  const filtered = notifList.filter((n) => filterChannel === 'all' || n.channel === filterChannel);

  const getIcon = (template: string) => {
    switch (template) {
      case 'Low-Stock Alert':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Appointment Confirmation':
      case 'Reservation Confirmation':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'Payment Receipt':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notifications & System Activity</h1>
          <p className="text-sm text-neutral-500">
            Real-time optical store alerts, customer appointment arrivals, stock reorder warnings, and automated SMS/WhatsApp logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
        {(['all', 'In-App System', 'SMS', 'WhatsApp', 'Email'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setFilterChannel(ch)}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filterChannel === ch
                ? 'border-b-2 border-neutral-900 text-neutral-900 font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {ch === 'all' ? 'All Channels' : ch} ({ch === 'all' ? notifList.length : notifList.filter((n) => n.channel === ch).length})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 border bg-white border-neutral-200 transition-colors flex items-start gap-4 hover:border-neutral-300"
          >
            <div className="p-2 rounded bg-neutral-50 border border-neutral-200 shrink-0 mt-0.5">
              {getIcon(item.template)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">{item.title}</h3>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {item.channel}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">{item.messageContent}</p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-2 font-mono">
                <span>To: {item.recipientName} ({item.recipient})</span>
                <span>&bull;</span>
                <span className={item.status === 'Delivered' ? 'text-emerald-700 font-semibold' : 'text-neutral-600'}>
                  Status: {item.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 self-center">
              {item.status === 'Failed' && (
                <Button size="sm" variant="outline" className="text-xs" onClick={() => retry(item.id)}>
                  Retry
                </Button>
              )}
              <button
                onClick={() => deleteNotification(item.id)}
                className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-red-600 rounded transition-colors"
                title="Dismiss"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-neutral-400 text-sm">
            No notifications in this channel.
          </div>
        )}
      </div>
    </div>
  );
};
