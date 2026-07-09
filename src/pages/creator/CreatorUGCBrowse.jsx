import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useLoading } from "../../contexts/LoadingContext";
import { Zap, Tag, Clock, Video, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorUGCBrowse() {
  const [briefs, setBriefs] = useState([]);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    api.get("/ugc/briefs/available").then(res => {
      setBriefs(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  }, []);

  const handleClaim = async () => {
    if(!selectedBrief) return;
    toast.loading("Claiming brief...", { id: 'claim' });
    try {
      const { data } = await api.post("/ugc/orders/claim", { brief_id: selectedBrief.id });
      toast.success("Brief claimed successfully!", { id: 'claim' });
      if (data.thread_id) {
        navigate(`/chat/${data.thread_id}`);
      } else {
        navigate("/creator/ugc/orders");
      }
    } catch(e) {
      toast.error(e.response?.data?.error || "Failed to claim", { id: 'claim' });
    }
  };

  const getPayout = (budget) => {
    const feePercent = budget <= 20000 ? 5 : 2;
    return budget - (budget * feePercent / 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Available UGC Briefs</h1>
      <p className="text-[var(--text-tertiary)] mb-8 font-medium">Claim a brief to produce original short-form content within 22 hours.</p>

      {briefs.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-3xl">
          <p className="text-[var(--text-tertiary)] font-medium">No open briefs right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {briefs.map(b => (
             <div key={b.id} onClick={() => setSelectedBrief(b)} className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent blur-[30px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="relative h-full bg-[var(--bg-card)] rounded-[2rem] overflow-hidden border border-[var(--border-default)] shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
                   {/* Top Half */}
                   <div className="bg-[var(--bg-card)] p-6 relative overflow-hidden flex-shrink-0 border-b border-[var(--border-default)]">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-elevated)] blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3B82F6]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0 shadow-inner">
                           <Video size={20} className="text-[var(--text-primary)]/80" />
                        </div>

                        <div className="flex flex-col items-end">
                           <span className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mb-1.5 drop-shadow-sm">Your Payout</span>
                           <span className="text-lg font-black text-emerald-400 bg-[var(--bg-elevated)] px-3 py-1 rounded-xl border border-[var(--border-default)] shadow-inner">₹{getPayout(b.budget).toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="flex bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-default)] shadow-sm">
                              <div className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-[#facc15]">
                                 <Zap size={10} /> 24-HOUR DELIVERY
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

                   {/* Bottom Half */}
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

                        {/* Progress Bar */}
                        <div className="relative mt-8 mb-2">
                           <div className="absolute inset-0 bg-[var(--bg-elevated)] rounded-full h-2 shadow-inner" />
                           <div 
                             className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-white shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-1000"
                             style={{ width: `${Math.min(100, ((b.claimed_count || 0)/(b.max_creators || 1))*100)}%` }} 
                           />
                           <div 
                             className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-card)] border-[3px] border-[var(--bg-card)] shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-1000 z-10"
                             style={{ left: `calc(${Math.min(100, ((b.claimed_count || 0)/(b.max_creators || 1))*100)}% - 12px)` }}
                           >
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7c3aed] to-white" />
                           </div>
                        </div>

                     </div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedBrief && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={()=>setSelectedBrief(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y: 20}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.95, opacity:0, y: 20}} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-2xl">
               <div className="inline-flex items-center gap-1.5 bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#facc15]/20 mb-4">
                 <Zap size={10} /> 22-Hour Delivery Promise
               </div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{selectedBrief.title}</h3>
               <p className="text-[var(--text-tertiary)] text-sm mb-6 pb-6 border-b border-[var(--border-default)]">{selectedBrief.product_description}</p>

               <div className="space-y-4 mb-8">
                 {selectedBrief.detailed_requirements && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Detailed Requirements</h4>
                     <p className="text-sm text-[var(--text-tertiary)] leading-relaxed bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">{selectedBrief.detailed_requirements}</p>
                   </div>
                 )}
                 {selectedBrief.sample_content_url && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Sample Reference</h4>
                     <a href={selectedBrief.sample_content_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--violet)] hover:underline underline-offset-4 flex items-center gap-1">
                       View Sample Content
                     </a>
                   </div>
                 )}
                 <div>
                   <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Do</h4>
                   <ul className="text-sm text-emerald-400 space-y-1">
                     {selectedBrief.dos?.[0] ? selectedBrief.dos.map((d, i) => <li key={i}>✅ {d}</li>) : <li>No specific requirements</li>}
                   </ul>
                 </div>
                 {selectedBrief.donts?.[0] && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Not Do</h4>
                     <ul className="text-sm text-[#ef4444] space-y-1">
                       {selectedBrief.donts.map((d, i) => <li key={i}>❌ {d}</li>)}
                     </ul>
                   </div>
                 )}
               </div>

               <div className="bg-[var(--bg-elevated)] border border-[#7c3aed]/30 rounded-xl p-4 mb-6">
                 <p className="text-sm font-medium text-purple-300">By claiming this brief, you commit to delivering the video within exactly 22 hours. Missing the deadline will cancel the order.</p>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#7c3aed]/20">
                   <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold">Your Payout</span>
                   <span className="text-emerald-400 font-black text-xl">₹{getPayout(selectedBrief.budget).toLocaleString()}</span>
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setSelectedBrief(null)} className="w-1/3 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl border border-[var(--border-default)] active:scale-95 transition-transform text-sm">Cancel</button>
                 <button onClick={handleClaim} className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg text-sm flex items-center justify-center gap-2">
                   <Zap size={16} /> I Commit — Claim Now
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
