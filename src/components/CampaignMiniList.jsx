import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Calendar, Users2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function CampaignMiniList({ campaigns = [] }) {
  const navigate = useNavigate();

  // Pick some structured active campaigns if none are provided
  const fallbackCampaigns = [
    { campaign_id: "sc-1", title: "Summer Glow Performance Series", category: "Beauty & Lifestyle", status: "LIVE", budget_min: 15000, budget_max: 25000, applicantsLength: 12, dealsLength: 4, deadline: "Jun 30, 2026" },
    { campaign_id: "sc-2", title: "Indian Food & Travel Vlogging Collab", category: "Food & Travel", status: "IN REVIEW", budget_min: 35000, budget_max: 50000, applicantsLength: 8, dealsLength: 2, deadline: "Jul 15, 2026" },
    { campaign_id: "sc-3", title: "Gen-Z Tech Gadgets Review Briefing", category: "Tech & Gaming", status: "LIVE", budget_min: 40000, budget_max: 65000, applicantsLength: 19, dealsLength: 7, deadline: "Jul 10, 2026" },
    { campaign_id: "sc-4", title: "Premium Fitwear Workout Reel", category: "Fitness & Health", status: "DRAFT", budget_min: 20000, budget_max: 30000, applicantsLength: 0, dealsLength: 0, deadline: "Jul 25, 2026" },
    { campaign_id: "sc-5", title: "Fintech App Launch Shorts Drive", category: "Fintech & Finance", status: "Approved", budget_min: 50000, budget_max: 80000, applicantsLength: 14, dealsLength: 5, deadline: "Jul 05, 2026" },
  ];

  // Map real database briefs to fill or override fallbacks
  const realCampaigns = campaigns.map(c => ({
    campaign_id: c.campaign_id || c.id,
    title: c.title,
    category: c.category || "General",
    status: c.status || "LIVE",
    budget_min: c.budget_min || 15000,
    budget_max: c.budget_max || c.budget || 25000,
    applicantsLength: c.applicants?.length || 0,
    dealsLength: c.deals?.length || 0,
    deadline: c.deadline || "Jun 30, 2026"
  }));

  // Concatenate so we always have at least 5 boxes covering the page beautifuly
  // If the user has real campaigns, they go first, then topped up with Fallback campaigns up to 5!
  const items = [...realCampaigns, ...fallbackCampaigns.slice(realCampaigns.length)].slice(0, 5);

  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "LIVE":
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "IN REVIEW":
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "DRAFT":
        return "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-default)]";
      default:
        return "bg-purple-500/10 text-[#9D7CFF] border border-[#7C5CFF]/20";
    }
  };

  return (
    <div className="w-full mt-10" data-testid="campaign-mini-list">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--border-default)] pb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#9D7CFF] animate-pulse" />
          <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
            Active Campaign Briefs
          </h3>
          <span className="text-xs text-[var(--text-tertiary)] font-medium hidden sm:inline">(Grid covering whole page with 5 boxes)</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/brand/campaigns/create")}
            className="p-2 px-4 rounded-xl bg-[#7C5CFF] hover:bg-[#6b4aff] text-[var(--text-primary)] hover:scale-[1.02] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} /> Post Briefing
          </button>
          <Link 
            to="/brand/campaigns" 
            className="text-xs font-bold text-[#9D7CFF] hover:text-[#7C5CFF] transition-all flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {items.map((camp, idx) => {
          const isLive = ["LIVE", "APPROVED"].includes((camp.status || "").toUpperCase());
          return (
            <div 
              key={camp.campaign_id || idx} 
              onClick={() => navigate(`/brand/campaigns`)}
              className="group flex flex-col justify-between bg-[var(--bg-card)]/70 hover:bg-[#15142a] border border-[var(--border-default)] hover:border-[#7C5CFF]/40 rounded-2xl p-6 shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden min-h-[300px] hover:shadow-[0_12px_36px_-12px_rgba(124,92,255,0.2)] cursor-pointer"
            >
              {/* Background radial glow on hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7C5CFF]/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Top Status */}
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-[#9D7CFF] bg-[#7C5CFF]/10 uppercase tracking-widest border border-[#7C5CFF]/15 font-sans">
                    {camp.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-full ${getStatusBadgeStyle(camp.status)}`}>
                    {camp.status || "live"}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight leading-snug group-hover:text-[#a98eff] transition-colors mb-4 line-clamp-2 min-h-[40px] flex items-start gap-2">
                  {camp.title}
                  {isLive && (
                    <span className="flex h-1.5 w-1.5 relative mt-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                </h4>

                {/* Budget Range Box */}
                <div className="bg-white/[0.02] border border-[var(--border-default)] rounded-xl p-3 mb-4">
                  <div className="text-[8px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-0.5">Budget Bracket</div>
                  <div className="text-sm font-black text-[#D9F111] font-mono">
                    ₹{camp.budget_min.toLocaleString("en-IN")} – ₹{camp.budget_max.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Bottom statistics */}
              <div className="mt-auto pt-3 border-t border-[var(--border-default)] flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 font-medium"><Users2 size={11} className="text-[#a98eff]" /> Applicants</span>
                  <span className="text-[var(--text-primary)] font-bold">{camp.applicantsLength}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 font-medium"><ShieldCheck size={11} className="text-emerald-400" /> Deals Done</span>
                  <span className="text-[var(--text-primary)] font-bold">{camp.dealsLength}</span>
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mt-1 uppercase font-mono">
                  <span>Deadline:</span>
                  <span className="text-[var(--text-secondary)] font-bold">{camp.deadline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
