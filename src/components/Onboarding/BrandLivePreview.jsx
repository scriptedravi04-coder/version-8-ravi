import React from "react";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

const DoodleArrowTooltip = ({ step, role }) => {
  return (
    <div className="absolute -left-36 md:-left-48 top-16 z-20 pointer-events-none opacity-0 md:opacity-100 hidden md:block">
      <svg className="w-16 h-16 md:w-24 md:h-24 text-[#3B82F6] translate-x-32 translate-y-12 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 90 Q 30 20 90 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" fill="none" />
        <path d="M75 10 L 95 20 L 80 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="bg-[var(--bg-card)] border border-[#3B82F6]/30 p-3 rounded-xl max-w-[200px] shadow-2xl relative translate-y-12">
        <p className="text-[#3B82F6] font-semibold text-sm mb-1 uppercase tracking-tight">Strategy</p>
        <p className="text-[var(--text-primary)]/80 text-xs">
          {step === 1 ? "A clear logo gets 3x more creator applications." : 
           step === 2 ? "Detailed backgrounds help match the right creator." : 
           "Clear budgets help align the best creators instantly."}
        </p>
      </div>
    </div>
  );
};

const BrandStepContextText = ({ step }) => {
  const texts = {
    1: { title: "Build Your Brand Identity", sub: "Help creators understand your vision." },
    2: { title: "Reach the Right Creators", sub: "Let them know your scale." },
    3: { title: "Set Campaign Preferences", sub: "Define what you're looking for." }
  };
  const current = texts[step] || texts[1];
  return (
    <div className="mt-6 text-center transform hover:scale-105 transition-transform">
      <p className="text-[var(--text-primary)] font-semibold text-sm">{current.title}</p>
      <p className="text-[var(--text-secondary)] text-xs mt-1">{current.sub}</p>
    </div>
  );
};

export default function BrandLivePreview({ formData, currentStep }) {
  return (
    <div className="sticky top-8 md:top-24 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      
      <div className="relative w-full max-w-[340px] sm:w-[320px]">
        <DoodleArrowTooltip step={currentStep} role="brand" />

        <div className="bg-[var(--bg-elevated)] rounded-[1.5rem] overflow-hidden border border-[var(--border-default)] w-full shadow-2xl transition-all duration-300 transform group hover:border-[#3B82F6]/30">
          
          {/* Brand Cover */}
          <div className="h-32 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] relative z-0 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
             {formData.logoUrl ? (
               <img src={formData.logoUrl} className="h-20 w-20 object-contain rounded-2xl bg-[var(--bg-elevated)] p-2 backdrop-blur-md shadow-2xl border border-[var(--border-default)] z-10" alt="Brand Logo" />
             ) : (
               <div className="h-20 w-20 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] p-2 backdrop-blur-md flex items-center justify-center text-3xl shadow-2xl z-10">
                 <Building2 className="text-blue-400 opacity-50" size={32} />
               </div>
             )}
          </div>

          <div className="p-5 relative z-10 bg-[var(--bg-elevated)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[var(--text-primary)] font-display font-bold text-lg leading-tight">
                  {formData.companyName || 'Brand Name'}
                </h3>
                <p className="text-blue-400 text-xs font-semibold mt-1">
                  {formData.industry || 'Industry'}
                  {formData.city ? ` • ${formData.city}` : ''}
                </p>
              </div>
              {formData.teamSize && (
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30 flex items-center">
                  Verified
                </span>
              )}
            </div>

            {formData.description && (
              <p className="text-[var(--text-tertiary)] text-[13px] mt-3 line-clamp-2 leading-relaxed bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">
                {formData.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-default)]">
              <div className="text-[11px] text-[var(--text-secondary)] uppercase font-black tracking-wider bg-[var(--bg-elevated)] px-2 py-1 rounded">
                Team: <span className="text-[var(--text-primary)]/80 font-bold ml-1">{formData.teamSize || '—'}</span>
              </div>
              {formData.websiteUrl && (
                <div className="text-[11px] text-blue-400 truncate max-w-[120px] ml-auto underline decoration-blue-500/30 underline-offset-4">
                  {formData.websiteUrl.replace(/^https?:\/\//, '')}
                </div>
              )}
            </div>

            <button className="mt-5 w-full bg-[#3B82F6] hover:bg-blue-600 text-[var(--text-primary)] text-sm py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5">
              Contact Brand
            </button>
          </div>
        </div>
      </div>

      <BrandStepContextText step={currentStep} />
    </div>
  );
}
