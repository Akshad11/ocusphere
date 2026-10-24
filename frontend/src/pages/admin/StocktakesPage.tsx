import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Plus, ClipboardList } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { mockInventoryService } from '../../services/mockInventoryService';
import { StocktakeSession } from '../../types/inventory.types';
import { formatDate } from '../../utils/dates';

export const StocktakesPage: React.FC = () => {
  const [sessions, setSessions] = useState<StocktakeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<StocktakeSession | null>(null);

  // New stocktake session modal
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [categoryOrBrand, setCategoryOrBrand] = useState('Titanium Frames & Sunglasses');
  const [auditedBy, setAuditedBy] = useState('Rahul Verma (Store Manager)');

  useEffect(() => {
    mockInventoryService.getStocktakes().then((data) => {
      setSessions(data);
      if (data.length > 0) setSelectedSession(data[0]);
      setLoading(false);
    });
  }, []);

  const handleCreateSession = async () => {
    if (!categoryOrBrand.trim()) return;
    const newSession: StocktakeSession = {
      id: `stk-${Date.now().toString().slice(-4)}`,
      reference: `STK-2026-${Math.floor(100 + Math.random() * 900)}`,
      categoryOrBrand,
      startedAt: new Date().toISOString(),
      auditedBy,
      status: 'In Progress',
      totalVarianceCount: 1,
      totalVarianceValue: 2400,
      items: [
        {
          variantId: 'var-001-1',
          variantSku: 'OCU-WAY-001-TOR',
          productName: 'OcuSphere Wayfarer Acetate Classic',
          systemStock: 14,
          countedStock: 13,
          variance: -1,
          unitCost: 1200,
        },
        {
          variantId: 'var-002-1',
          variantSku: 'OCU-TITAN-002-GUN',
          productName: 'OcuSphere Titanium Air Ultra-Light',
          systemStock: 8,
          countedStock: 8,
          variance: 0,
          unitCost: 1400,
        },
      ],
    };
    await mockInventoryService.saveStocktake(newSession);
    setSessions([newSession, ...sessions]);
    setSelectedSession(newSession);
    setIsNewOpen(false);
  };

  const handleReconcile = async (sessionId: string) => {
    if (confirm('Reconcile this stocktake session? System stock will be adjusted to counted quantities.')) {
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        const updated: StocktakeSession = {
          ...target,
          status: 'Reconciled',
          completedAt: new Date().toISOString(),
        };
        await mockInventoryService.saveStocktake(updated);
        setSessions(sessions.map((s) => (s.id === sessionId ? updated : s)));
        setSelectedSession(updated);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/inventory" className="p-2 border border-neutral-200 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Physical Stocktakes & Audits</h1>
            <p className="text-sm text-neutral-500">
              Periodic cycle counts, discrepancy investigations, and inventory reconciliations
            </p>
          </div>
        </div>

        <Button onClick={() => setIsNewOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Start New Stocktake
        </Button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white border p-5 transition-shadow cursor-pointer ${
              selectedSession?.id === session.id
                ? 'border-neutral-900 shadow-sm'
                : 'border-neutral-200 hover:border-neutral-400'
            }`}
            onClick={() => setSelectedSession(session)}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="font-mono text-xs text-neutral-500 block">{session.reference}</span>
                <h3 className="font-bold text-neutral-900">{session.categoryOrBrand}</h3>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  session.status === 'Completed' || session.status === 'Reconciled'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {session.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
              <p>Audited by: <strong className="text-neutral-900">{session.auditedBy}</strong></p>
              <p>Started: <span className="font-mono">{formatDate(session.startedAt)}</span></p>
              {session.completedAt && (
                <p>Finished: <span className="font-mono">{formatDate(session.completedAt)}</span></p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500">
                Audited: <strong className="text-neutral-900 font-mono">{session.items.length}</strong> items
              </span>
              <span className={session.totalVarianceCount > 0 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                {session.totalVarianceCount} Discrepancies
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Session Details */}
      {selectedSession && (
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Audit Session: {selectedSession.reference} ({selectedSession.categoryOrBrand})
              </h2>
              <p className="text-xs text-neutral-500">
                Auditor: {selectedSession.auditedBy} | Status: {selectedSession.status}
              </p>
            </div>
            {selectedSession.status === 'In Progress' && (
              <Button size="sm" onClick={() => handleReconcile(selectedSession.id)}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Reconcile Stock Differences
              </Button>
            )}
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-center">Expected (System)</th>
                <th className="py-2.5 px-3 text-center">Counted (Physical)</th>
                <th className="py-2.5 px-3 text-center">Variance</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {selectedSession.items?.map((item, idx) => (
                <tr key={item.variantId || idx} className="hover:bg-neutral-50/60">
                  <td className="py-2.5 px-3 font-mono text-xs text-neutral-800">{item.variantSku}</td>
                  <td className="py-2.5 px-3 font-medium text-neutral-900">{item.productName}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.systemStock}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{item.countedStock}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                    <span
                      className={
                        item.variance === 0
                          ? 'text-neutral-500'
                          : item.variance > 0
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }
                    >
                      {item.variance > 0 ? `+${item.variance}` : item.variance}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs text-neutral-700">
                    ₹{item.unitCost.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Session Modal */}
      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Start New Physical Stocktake">
        <div className="space-y-4">
          <Input
            label="Audit Category or Brand Target"
            placeholder="e.g. Titanium Frames & Sunglasses"
            value={categoryOrBrand}
            onChange={(e) => setCategoryOrBrand(e.target.value)}
          />
          <Input
            label="Assigned Lead Auditor"
            value={auditedBy}
            onChange={(e) => setAuditedBy(e.target.value)}
          />
          <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
            Starting an audit cycle count locks live reconciliation until counts are submitted.
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>Start Audit Count</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
