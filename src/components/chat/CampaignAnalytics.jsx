import React from "react";
import { 
  BarChart3, TrendingUp, Users, Flame, MapPin, Sparkles, CheckCircle2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CampaignAnalytics({ thread, user, onClose }) {
  const isBrand = user?.role === 'brand' || user?.user_type === 'brand';
  
  if (!thread) return null;

  return (
    <motion.div 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="border-l border-[var(--border-default)] flex-col bg-[var(--bg-card)] shrink-0 overflow-y-auto no-scrollbar flex"
    >
      {/* Analytics Header */}
      <div className="p-5 border-b border-[var(--border-default)] h-20 shrink-0 flex items-center justify-between bg-[var(--bg-elevated)]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[var(--violet)]/10 text-[var(--violet)] rounded-xl flex items-center justify-center border border-[var(--violet)]/20 shadow-sm">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight">Campaign Analytics</h3>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Stream
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
          title="Close Analytics"
        >
          <X size={16} />
        </button>
      </div>

      {/* Analytics Body */}
      <div className="p-5 space-y-6">
        {/* Active Campaign Title Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-[var(--bg-base)] to-slate-900/30 border border-[var(--border-default)] rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-5">
            <Sparkles size={40} className="text-indigo-400" />
          </div>
          <span className="text-[9px] text-[var(--violet)] font-bold tracking-widest uppercase block">Selected Partner Tracker</span>
          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
            {isBrand ? (thread.creator?.name || 'Alisha') : (thread.brand?.name || 'GutarGoo')}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            <span>Udaipur Professional Network</span>
          </div>
        </div>

        {/* Dials & Progress Section */}
        <div className="space-y-4">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest block">KPI Milestones</span>
          
          {/* 1. Engagement Rate */}
          <div className="bg-[var(--bg-elevated)]/40 border border-[var(--border-default)] rounded-xl p-3.5 space-y-1.5 hover:border-[var(--border-strong)] transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Flame size={14} className="text-orange-500" /> Niche Engagement
              </span>
              <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={12} /> +12.4%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-[var(--text-primary)]">4.85%</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">vs Industry Avg (2.4%)</span>
            </div>
            {/* Gauge bar */}
            <div className="w-full bg-[var(--bg-base)] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[78%] rounded-full" />
            </div>
          </div>

          {/* 2. Projected Reach */}
          <div className="bg-[var(--bg-elevated)]/40 border border-[var(--border-default)] rounded-xl p-3.5 space-y-1.5 hover:border-[var(--border-strong)] transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Users size={14} className="text-[var(--violet)]" /> Audience Reach
              </span>
              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">148.5K</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-[var(--text-primary)]">94.2K</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Estimated Imp.</span>
            </div>
            <div className="w-full bg-[var(--bg-base)] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--violet)] to-fuchsia-500 h-full w-[64%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Geographic Dispersion */}
        <div className="space-y-3">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest block">Geographic Demographics</span>
          <div className="space-y-2.5 bg-[var(--bg-elevated)]/20 p-3.5 rounded-xl border border-[var(--border-default)]">
            {/* Udaipur */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">📍 Udaipur, RJ</span>
                <span className="font-bold text-[var(--text-secondary)]">42%</span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[42%] rounded-full" />
              </div>
            </div>

            {/* Delhi NCR */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">📍 Delhi NCR, IN</span>
                <span className="font-bold text-[var(--text-secondary)]">28%</span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-1 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[28%] rounded-full" />
              </div>
            </div>

            {/* Jaipur */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">📍 Jaipur, RJ</span>
                <span className="font-bold text-[var(--text-secondary)]">18%</span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-1 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[18%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Seal */}
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <p>Escrow payment guarantee is strictly active. Milestone payout remains securely locked until content post URL validates.</p>
        </div>
      </div>
    </motion.div>
  );
}
