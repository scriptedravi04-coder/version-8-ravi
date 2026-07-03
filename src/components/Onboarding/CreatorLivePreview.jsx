import React from "react";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";

const formatNumber = (n) => {
  if (!n) return "0";
  const num = parseInt(n);
  if (isNaN(num)) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
};

const DoodleArrowTooltip = ({ step, role }) => {
  return (
    <div className="absolute -left-36 md:-left-48 top-16 z-20 pointer-events-none opacity-0 md:opacity-100 hidden md:block">
      <svg className="w-16 h-16 md:w-24 md:h-24 text-[#D9F111] translate-x-32 translate-y-12 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 90 Q 30 20 90 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" fill="none" />
        <path d="M75 10 L 95 20 L 80 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="bg-[var(--bg-card)] border border-[#D9F111]/30 p-3 rounded-xl max-w-[200px] shadow-2xl relative translate-y-12">
        <p className="text-[#D9F111] font-semibold text-sm mb-1 uppercase tracking-tight">Pro Tip</p>
        <p className="text-[var(--text-primary)]/80 text-xs">
          {role === 'brand' ? (
            step === 1 ? "A clear logo gets 3x more creator applications." :
            step === 2 ? "GST Verification tags boost your trust significantly." :
            "Clear budgets help align the best creators instantly."
          ) : (
            step === 1 ? "A complete identity helps brands find you instantly." :
            step === 2 ? "📍 Local Brands will target you via smart filters." :
            step === 3 ? "Authentic Metrics 📊 — Verified stats build immense trust with brands." :
            "💰 Setting clear rates secures your income in escrow."
          )}
        </p>
      </div>
    </div>
  );
};

const StepContextText = ({ step }) => {
  const texts = {
    1: { title: "Start Building Your Profile", sub: "Add your core identity details." },
    2: { title: "Attract Local Opportunities", sub: "Define your region and limits." },
    3: { title: "Stand Out with Verified Stats", sub: "Link your accounts securely." },
    4: { title: "Set Your Worth", sub: "Define your rates and payment modes." }
  };
  const current = texts[step] || texts[1];
  return (
    <div className="mt-6 text-center transform hover:scale-105 transition-transform">
      <p className="text-[var(--text-primary)] font-semibold text-sm">{current.title}</p>
      <p className="text-[var(--text-secondary)] text-xs mt-1">{current.sub}</p>
    </div>
  );
};

export default function CreatorLivePreview({ formData, currentStep, user }) {
  return (
    <div className="sticky top-8 md:top-24 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      
      <div className="relative w-full max-w-[340px] sm:w-[320px]">
        <DoodleArrowTooltip step={currentStep} role="creator" />

        <div className="bg-[var(--bg-elevated)] rounded-[1.5rem] overflow-hidden border border-[var(--border-default)] w-full shadow-2xl transition-all duration-300 transform group hover:border-[#7C5CFF]/30">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-br from-purple-900/80 to-slate-800 relative z-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>

          {/* Avatar & Details */}
          <div className="px-5 pb-5 relative z-10 bg-gradient-to-b from-transparent to-[#1a1a2e]">
            <img
              src={formData.photoUrl || '/avatar2.png'}
              alt="Avatar"
              className="-mt-12 w-20 h-20 rounded-full border-[3px] border-[#1a1a2e] object-cover bg-[#2a2a3b] shadow-lg mb-3"
            />
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[var(--text-primary)] font-display font-bold text-lg leading-tight truncate">
                    {formData.name || user?.name || 'Your Name'}
                  </h3>
                  {formData.languages?.[0] && (
                    <span className="text-[10px] uppercase font-bold bg-[#D9F111]/20 text-[#D9F111] px-2 py-[2px] rounded-full shrink-0 flex items-center gap-1 border border-[#D9F111]/30">
                      FLAG {formData.languages[0]}
                    </span>
                  )}
                </div>
                <p className="text-[#a8b2d1] text-xs font-semibold mt-0.5">
                  {formData.category || 'Your Content Niche'}
                </p>
              </div>

              {formData.city && (
                <p className="text-[var(--text-tertiary)] text-xs flex items-center gap-1.5 bg-[var(--bg-elevated)] py-1 px-2.5 rounded-lg w-max border border-[var(--border-default)]">
                  <span className="text-[#7C5CFF]">📍</span> {formData.city}{formData.state ? `, ${formData.state}` : ''}
                </p>
              )}

              {formData.bio && (
                <p className="text-[#8892b0] text-[13px] leading-relaxed line-clamp-2 italic border-l-2 border-[#7C5CFF]/40 pl-3">
                  "{formData.bio}"
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)] mt-2">
                <div>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center gap-1 mb-0.5">
                    <Instagram size={12} /> Followers
                  </p>
                  <p className="text-[#c1aeff] font-display font-bold text-lg">
                    {formatNumber(formData.followers)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-wider flex items-center gap-1 mb-0.5">
                    📊 Avg Reach
                  </p>
                  <p className="text-[var(--text-primary)] font-display font-bold text-lg">
                    {formatNumber(formData.avgReach)}
                  </p>
                </div>
                <button className="bg-[var(--bg-elevated)] hover:bg-white text-[var(--text-primary)] hover:text-black transition-colors text-xs px-4 py-2 rounded-xl font-bold border border-white/20">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepContextText step={currentStep} />
    </div>
  );
}
