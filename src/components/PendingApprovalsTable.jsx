import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Search, Clock } from 'lucide-react';

export default function PendingApprovalsTable() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/admin/payment-methods/pending');
      setMethods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/payment-methods/${id}/approve`);
      toast.success('Payment method approved!');
      fetchPending();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await api.post(`/admin/payment-methods/${id}/reject`, { reason: rejectionReason });
      toast.success('Payment method rejected');
      setRejectingId(null);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <div className="h-48 bg-[var(--bg-elevated)] animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="text-amber-400" size={20} />
          Pending Payment Methods
        </h2>
        <div className="bg-[var(--bg-elevated)] rounded-xl px-3 py-1.5 flex items-center gap-2 border border-[var(--border-default)]">
          <Search size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{methods.length} Pending</span>
        </div>
      </div>

      {methods.length === 0 ? (
        <div className="p-12 text-center text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] m-6 rounded-2xl">
          <CheckCircle className="mx-auto mb-4 opacity-50" size={32} />
          No pending approvals queue is clear!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-foreground/5">
                <th className="p-4 pl-6 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Creator ID</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Details</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Added On</th>
                <th className="p-4 pr-6 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="p-4 pl-6 font-mono text-xs text-[var(--text-primary)]/80">{m.creator_id.slice(0,8)}...</td>
                  <td className="p-4 text-sm font-bold text-[var(--text-primary)]">
                    <span className="bg-foreground/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{m.method_type}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-[var(--text-primary)]/60 font-mono max-w-[200px] truncate">
                      {m.method_type === 'UPI' ? m.account_details.upi_id : `${m.account_details.account_no} (${m.account_details.ifsc})`}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[var(--text-secondary)]">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="p-4 pr-6">
                    {rejectingId === m.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <input 
                          type="text" 
                          placeholder="Reason..." 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="bg-[var(--bg-elevated)] text-xs px-2 py-1.5 rounded border border-rose-500/30 text-rose-200 outline-none w-32"
                          autoFocus
                        />
                        <button onClick={() => handleReject(m.id)} className="bg-rose-500 hover:bg-rose-600 text-[var(--text-primary)] p-1.5 rounded transition-colors"><CheckCircle size={14}/></button>
                        <button onClick={() => setRejectingId(null)} className="bg-foreground/10 hover:bg-foreground/20 text-[var(--text-primary)] p-1.5 rounded transition-colors"><XCircle size={14}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(m.id)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1.5 text-xs font-bold transition-colors">
                          <CheckCircle size={14}/> Approve
                        </button>
                        <button onClick={() => setRejectingId(m.id)} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded flex items-center gap-1.5 text-xs font-bold transition-colors">
                          <XCircle size={14}/> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
