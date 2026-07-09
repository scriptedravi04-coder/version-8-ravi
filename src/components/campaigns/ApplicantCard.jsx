import React from "react";
import { MessageSquare, X, Check, Eye } from "lucide-react";

export default function ApplicantCard({ applicant, onShortlist, onReject, onViewProfile }) {
  const a = applicant;
  const followersCount = a.followers_count || "125K";
  const rateProposed = a.proposed_rate || "₹12,000";
  const estDelivery = a.delivery_days || "5 days";
  const bio = a.pitch_text || "I've worked with top-tier electronic brands in India before. My technical reviews average 40k+ real reach with high retention.";

  return (
    <div className="bg-[var(--bg-card)]/80 border border-[var(--border-default)] p-5 rounded-2xl shadow-sm text-left relative overflow-hidden hover:border-[#7C5CFF]/20 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Author Avatar & details */}
        <div className="flex items-start gap-3.5">
          <img 
            src={a.profile_photo_url || a.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
            alt={a.full_name} 
            className="w-12 h-12 rounded-xl object-cover border border-[var(--border-default)] shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">{a.full_name || "Ravi Kumar"}</h4>
              <span className="text-xs font-mono font-bold text-[#9D7CFF]">{followersCount} followers</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 font-sans">
              <span>@{a.instagram_handle || "ravi_tech"}</span>
              <span>•</span>
              <span>{a.category || "Tech"}</span>
              <span>•</span>
              <span>{a.city || "Mumbai"}</span>
            </div>
          </div>
        </div>

        {/* Commercial summary */}
        <div className="bg-white/[0.02] border border-[var(--border-default)] px-4 py-2.5 rounded-xl text-left sm:text-right font-mono min-w-[140px]">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Proposed Fee</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{rateProposed}</div>
          <div className="text-[9px] text-[var(--text-secondary)] mt-1">Delivery: {estDelivery}</div>
        </div>
      </div>

      {/* Pitch pitch */}
      <div className="mt-4 bg-white/[0.02] border-l border-[#7C5CFF]/30 pl-3.5 py-1 text-xs text-[var(--text-secondary)] leading-relaxed italic">
        &ldquo;{bio}&rdquo;
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onViewProfile && onViewProfile(a)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Eye size={13} /> View Profile
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReject && onReject(a)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X size={14} /> Reject
          </button>
          
          <button
            onClick={() => onShortlist && onShortlist(a)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#7C5CFF] hover:bg-[#6B4AFF] text-[var(--text-primary)] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare size={14} /> Shortlist & Chat
          </button>
        </div>
      </div>
    </div>
  );
}
