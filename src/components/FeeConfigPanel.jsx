import React, { useState, useEffect } from 'react';
import { Settings2, Save } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function FeeConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    threshold_amount: 20000,
    below_threshold_rate: 5,
    above_threshold_rate: 2,
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/admin/fee-config');
      if (data) setConfig(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: updated } = await api.put('/admin/fee-config', config);
      setConfig(updated);
      toast.success('Fee configuration updated successfully');
    } catch (err) {
      toast.error('Failed to update config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-48 bg-[var(--bg-elevated)] animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
          <Settings2 size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Platform Fee Configuration</h2>
          <p className="text-sm text-[var(--text-secondary)]">Admin controls for YBEX platform fee dynamic rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Threshold Amount (₹)</label>
          <input 
            type="number" 
            value={config.threshold_amount}
            onChange={(e) => setConfig({...config, threshold_amount: Number(e.target.value)})}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C3AED] font-mono tracking-wider"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Rate Below Threshold (%)</label>
          <input 
            type="number" 
            value={config.below_threshold_rate}
            onChange={(e) => setConfig({...config, below_threshold_rate: Number(e.target.value)})}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C3AED] font-mono tracking-wider"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Rate Above Threshold (%)</label>
          <input 
            type="number" 
            value={config.above_threshold_rate}
            onChange={(e) => setConfig({...config, above_threshold_rate: Number(e.target.value)})}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C3AED] font-mono tracking-wider"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-foreground/5 pt-6">
        <div className="text-xs text-[var(--text-tertiary)] font-medium">
          Last updated: {new Date(config.updated_at || Date.now()).toLocaleString()}
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
