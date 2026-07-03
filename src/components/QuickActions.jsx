import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Users2, FileVideo, Coins } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Campaign",
      icon: ClipboardList,
      color: "text-[#D9F111]",
      desc: "Post a briefing & configure goals",
      route: "/brand/campaigns/create"
    },
    {
      label: "View Applicants",
      icon: Users2,
      color: "text-indigo-400",
      desc: "Check pitched entries & rate cards",
      route: "/brand/campaigns"
    },
    {
      label: "Review Drafts",
      icon: FileVideo,
      color: "text-purple-400",
      desc: "Approve creative deliverables",
      route: "/brand/campaigns"
    },
    {
      label: "Release Payment",
      icon: Coins,
      color: "text-emerald-400",
      desc: "Release payouts from secured escrow",
      route: "/brand/payments"
    }
  ];

  return (
    <div className="bg-[var(--bg-card)]/90 border border-[var(--border-default)] p-6 rounded-xl shadow-sm text-left relative overflow-hidden">
      <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Quick Gates</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              id={`quick-action-${idx}`}
              onClick={() => navigate(act.route)}
              className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-default)] text-left transition-all hover:bg-[#7C5CFF]/10 hover:border-[#7C5CFF]/25 hover:shadow-[0_8px_30px_rgba(124,92,255,0.06)] group cursor-pointer"
            >
              <Icon size={24} className={`${act.color} mb-3 group-hover:scale-110 transition-transform duration-200`} />
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#9D7CFF] transition-colors">{act.label}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1 lines-clamp-1">{act.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
