import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { ShieldAlert, MessageSquare, Search, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatDashboard() {
  const [threads, setThreads] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [tab, setTab] = useState('flags'); // 'flags' or 'all'
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [threadsRes, flaggedRes] = await Promise.all([
        api.get('/admin/chat/all'),
        api.get('/admin/chat/flagged')
      ]);
      setThreads(threadsRes.data || []);
      setFlagged(flaggedRes.data || []);
    } catch (err) {
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (flagId, action) => {
    try {
      await api.post(`/admin/chat/flagged/${flagId}/resolve`, { action });
      toast.success(`Action taken: ${action}`);
      loadData();
    } catch (err) {
      toast.error('Action failed');
    }
  }

  if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading chat metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-[var(--border-default)] pb-4">
        <button 
           onClick={() => setTab('flags')} 
           className={`font-bold flex items-center gap-2 ${tab === 'flags' ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}
        >
          <ShieldAlert size={18} /> Flagged Messages ({flagged.length})
        </button>
        <button 
           onClick={() => setTab('all')} 
           className={`font-bold flex items-center gap-2 ${tab === 'all' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          <MessageSquare size={18} /> All Threads
        </button>
      </div>

      {tab === 'flags' && (
        <div className="space-y-4">
          {flagged.length === 0 && <p className="text-[var(--text-secondary)] bg-[var(--bg-elevated)] rounded-2xl p-8 text-center">No pending flagged messages.</p>}
          {flagged.map(f => (
            <div key={f.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-red-500/10 text-red-600 px-2.5 py-1 rounded-sm text-xs font-bold uppercase">{f.severity} RISK</span>
                  <p className="text-[var(--text-primary)] font-medium mt-2">{f.reason}</p>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">{new Date(f.created_at).toLocaleString()}</span>
              </div>
              
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4">
                <span className="text-[var(--text-tertiary)] text-xs mb-1 block">Flagged Content:</span>
                <p className="text-[var(--text-primary)]/90 text-sm font-mono">&quot;{f.message?.content}&quot;</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => handleAction(f.id, 'WARN')} className="flex-1 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 py-2 rounded-xl text-sm font-bold transition-colors border border-amber-500/30">
                  Issue Warning
                </button>
                <button onClick={() => handleAction(f.id, 'SUSPEND')} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded-xl text-sm font-bold transition-colors border border-red-500/30">
                  Suspend User
                </button>
                <button onClick={() => handleAction(f.id, 'DISMISS')} className="px-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] py-2 rounded-xl text-sm font-bold transition-colors border border-[var(--border-default)]">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        <div className="overflow-hidden border border-[var(--border-default)] rounded-2xl bg-[var(--bg-elevated)]">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {threads.map(t => (
                <tr key={t.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="p-4 font-medium text-[var(--text-primary)]">{t.creator?.name || 'Unknown'}</td>
                  <td className="p-4 font-medium text-[var(--text-primary)]">{t.brand?.name || 'Unknown'}</td>
                  <td className="p-4">
                    <span className="bg-[var(--bg-elevated)] px-2 py-1 rounded text-xs font-bold tracking-wide">{t.status}</span>
                  </td>
                  <td className="p-4 text-center font-bold">₹{t.agreed_amount || 0}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors text-[var(--text-primary)]">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {threads.length === 0 && <div className="p-8 text-center">No threads found.</div>}
        </div>
      )}
    </div>
  );
}
