import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useLoading } from "../../contexts/LoadingContext";
import { Plus, PlayCircle, Clock, CheckCircle, Pause, Zap, Video } from "lucide-react";

export default function BrandUGCBriefs() {
  const [briefs, setBriefs] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    api.get("/ugc/briefs/my").then(res => {
      setBriefs(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  }, []);

  const stats = {
    total: briefs.length,
    open: briefs.filter(b => b.status === 'OPEN').length,
    progress: briefs.filter(b => b.status === 'IN_PROGRESS').length,
    completed: briefs.filter(b => b.status === 'COMPLETED').length
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-8 lg:py-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">My UGC Briefs</h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Manage your active product UGC requests</p>
        </div>
        <button 
          onClick={() => navigate("/brand/ugc/post")}
          className="bg-[#facc15] hover:bg-[#eab308] text-black font-bold px-6 py-3 rounded-full text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
        >
          <Plus size={16} /> Post New UGC Brief
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
        {[
          { label: "Total", val: stats.total, color: "text-[var(--text-primary)]" },
          { label: "Open", val: stats.open, color: "text-[#facc15]" },
          { label: "In Progress", val: stats.progress, color: "text-blue-400" },
          { label: "Completed", val: stats.completed, color: "text-emerald-400" }
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl rounded-[2rem] p-6 lg:p-8">
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest">{s.label}</span>
            <div className={`text-3xl lg:text-4xl font-display font-black mt-2 ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        {briefs.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No active briefs</h3>
            <p className="text-[var(--text-secondary)] mb-8 font-medium">Post a brief to get original creator videos within 24 hours.</p>
            <button onClick={() => navigate("/brand/ugc/post")} className="bg-[var(--violet)] text-white font-bold px-8 py-3.5 rounded-full text-sm hover:bg-[var(--bg-elevated)] transition-colors shadow-lg active:scale-95">Create Brief</button>
          </div>
        ) : briefs.map(b => (
           <div key={b.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent blur-[30px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative h-full bg-[var(--bg-card)] rounded-[2rem] overflow-hidden border border-[var(--border-default)] shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
                 
                 {/* Top Half (Lightened dark for contrast) */}
                 <div className="bg-[var(--bg-card)] p-6 relative overflow-hidden flex-shrink-0 border-b border-[var(--border-default)]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-elevated)] blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                   
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3B82F6]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0 shadow-inner">
                         <Video size={20} className="text-[var(--text-primary)]/80" />
                      </div>

                      <div className="flex flex-col items-end">
                         <span className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mb-1.5 drop-shadow-sm">Budget</span>
                         <span className="text-base font-black text-[var(--text-primary)] bg-[var(--bg-elevated)] px-3 py-1 rounded-xl border border-[var(--border-default)] shadow-inner">₹{b.budget?.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-default)] shadow-sm">
                           <div className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-[var(--text-secondary)]">
                              {b.status === 'OPEN' && <span className="text-[#facc15] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse" /> OPEN</span>}
                              {b.status === 'IN_PROGRESS' && <span className="text-blue-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> ACTIVE</span>}
                              {b.status === 'COMPLETED' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10}/> DONE</span>}
                           </div>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight line-clamp-1">{b.title || "UGC Campaign"}</h2>
                   </div>

                   <div className="flex items-center justify-between mt-4 border-t border-[var(--border-default)] pt-4">
                      <p className="text-sm font-medium text-[var(--text-secondary)] line-clamp-1 flex-1 pr-2">{b.product_name}</p>
                      <span className="bg-[var(--bg-elevated)] text-[var(--text-primary)]/80 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[var(--border-default)] shadow-sm shrink-0">
                         {b.claimed_count || 0} / {b.max_creators || 1} CLAIMED
                      </span>
                   </div>
                 </div>

                 {/* Bottom Half (Darkest, auto takes remaining space) */}
                 <div className="bg-[var(--bg-card)] p-6 flex-1 flex flex-col justify-end">
                   <div>
                      <div className="flex justify-between items-end mb-4">
                         <div>
                            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-2">Claim Progress</p>
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-3xl font-display font-black tracking-tight text-[var(--text-primary)]">{Math.round(((b.claimed_count || 0)/(b.max_creators || 1))*100)}%</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-wider shrink-0 mb-1">
                            {b.video_duration || '30s'} <PlayCircle size={12} className="text-[var(--violet)]" />
                         </div>
                      </div>

                      {/* The Slider / Progress Bar */}
                      <div className="relative mt-8 mb-6">
                         <div className="absolute inset-0 bg-[var(--bg-elevated)] rounded-full h-2 shadow-inner" />
                         <div 
                           className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[var(--text-primary)] shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all duration-1000`} 
                           style={{ width: `${Math.min(100, ((b.claimed_count || 0)/(b.max_creators || 1))*100)}%` }} 
                         />
                         {/* Thumb */}
                         <div 
                           className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-card)] border-[3px] border-[var(--bg-card)] shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center transition-all duration-1000 z-10"
                           style={{ left: `calc(${Math.min(100, ((b.claimed_count || 0)/(b.max_creators || 1))*100)}% - 12px)` }}
                         >
                            <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#7c3aed] to-[var(--text-primary)]`} />
                         </div>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-[var(--border-default)]">
                         <button onClick={() => navigate("/brand/ugc/orders")} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] active:bg-white/15 border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-bold py-3 rounded-xl transition-colors">Orders</button>
                         <button className="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]/80 text-xs font-bold py-3 rounded-xl transition-colors border border-transparent">Pause</button>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
