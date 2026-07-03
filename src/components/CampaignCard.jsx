import React from "react";
import { ChevronRight, Calendar, Users2, ShieldCheck, AlertCircle, Video } from "lucide-react";

export default function CampaignCard({ campaign, onManage, onEdit, onSubmit }) {
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "LIVE":
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
      case "DRAFT":
        return "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-default)]";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
  };

  const c = campaign;
  const isLive = (c.status || "").toLowerCase() === "live" || (c.status || "").toLowerCase() === "approved";
  const isDraft = (c.status || "").toLowerCase() === "draft" || !c.status;

  // Format platforms beautifully
  const platformsList = c.platforms || [];
  const platformsStr = platformsList.length > 0 ? platformsList.join(", ") : "Instagram";

  return (
    <div className="relative group cursor-pointer h-full" onClick={() => !isDraft && onManage && onManage(c)}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#7C5CFF]/10 to-transparent blur-[30px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative h-full min-h-[380px] bg-[var(--bg-card)] rounded-[2rem] overflow-hidden border border-[var(--border-default)] shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
         {/* Top Half */}
         <div className="bg-[var(--bg-elevated)] p-6 relative overflow-hidden flex-shrink-0 border-b border-[var(--border-default)]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFF]/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
           
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3B82F6]/20 border border-[#7C5CFF]/30 flex items-center justify-center shrink-0 shadow-inner">
                 <Video size={20} className="text-[var(--text-primary)]/80" />
              </div>

              <div className="flex flex-col items-end">
                 <span className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mb-1.5 drop-shadow-sm">{c.budget_min === 0 ? "Collab Mode" : "Estimated Budget"}</span>
                 <span className="text-sm font-black text-[var(--text-primary)] bg-[var(--bg-elevated)] px-3 py-1 rounded-xl border border-[var(--border-default)] shadow-inner whitespace-nowrap">
                   {c.budget_min === 0 ? "Barter" : `₹${(c.budget_min || 10000).toLocaleString("en-IN")} ${c.budget_max ? `- ₹${c.budget_max.toLocaleString("en-IN")}` : '+'}`}
                 </span>
              </div>
           </div>

           <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                 <div className="flex bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-default)] shadow-sm">
                    <div className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-[var(--text-secondary)]">
                       <span className={`px-1 rounded-md ${getStatusBadgeStyle(c.status || "live")}`}>{c.status || "live"}</span>
                    </div>
                 </div>
                 <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-default)]">{platformsStr}</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight line-clamp-2 min-h-[56px]">{c.title || "Brand Campaign"}</h2>
           </div>

         </div>

         {/* Bottom Half */}
         <div className="bg-[var(--bg-card)] p-6 flex-1 flex flex-col justify-end">
           <div>
              {isDraft ? (
                 <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-left mb-4">
                   <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                     <AlertCircle size={11} /> Draft Briefing
                   </span>
                   <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                     Created but not submitted for verification yet. Click launch to start.
                   </p>
                 </div>
              ) : (
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 text-center">
                       <p className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-1">Applicants</p>
                       <div className="flex items-center justify-center gap-2">
                          <Users2 size={14} className="text-[#9D7CFF]" />
                          <span className="text-2xl font-display font-black tracking-tight text-[var(--text-primary)]">{c.applicants?.length || 0}</span>
                       </div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                       <p className="text-[9px] text-emerald-400/50 font-bold uppercase tracking-widest mb-1">Deals</p>
                       <div className="flex items-center justify-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span className="text-2xl font-display font-black tracking-tight text-[var(--text-primary)]">{c.deals?.length || 0}</span>
                       </div>
                    </div>
                 </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-4 border-t border-[var(--border-default)] pt-4 mb-4">
                 <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[var(--text-tertiary)]"/> Deadline:</span>
                 {(() => {
                   let expiryDays = 0;
                   if (c.deadline) {
                     const diff = new Date(c.deadline).getTime() - Date.now();
                     expiryDays = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
                   }
                   const endsSoon = expiryDays > 0 && expiryDays <= 3;
                   return (
                     <span className={`px-2 py-0.5 rounded border ${endsSoon ? 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse' : 'text-[var(--text-primary)] border-transparent'}`}>
                        {expiryDays > 0 ? `Ends in ${expiryDays}d` : c.deadline || "Jun 30, 2026"}
                     </span>
                   );
                 })()}
              </div>

              <div className="flex gap-3">
                 {isDraft ? (
                    <>
                       <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(c); }} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] active:bg-white/15 border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-bold py-3 rounded-xl transition-colors">Edit</button>
                       <button onClick={(e) => { e.stopPropagation(); onSubmit && onSubmit(c); }} className="flex-[1.5] bg-[#7C5CFF] hover:bg-[#6B4AFF] text-[var(--text-primary)] text-xs font-bold py-3 rounded-xl transition-colors shadow-lg">Launch</button>
                    </>
                 ) : (
                    <>
                       <button onClick={(e) => { e.stopPropagation(); onManage && onManage(c); }} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]/80 text-xs font-bold py-3 rounded-xl transition-colors">View Details</button>
                       <button onClick={(e) => { e.stopPropagation(); onManage && onManage(c); }} className="flex-[1.5] flex items-center justify-center gap-1 bg-[#7c3aed]/20 text-[#a98eff] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/30 text-xs font-bold py-3 rounded-xl transition-colors">Manage <ChevronRight size={14}/></button>
                    </>
                 )}
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
