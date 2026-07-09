import React from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { Shield } from "lucide-react";

export default function Step4_RateCard({
  user,
  onSubmit,
}: {
  user: any;
  onSubmit: () => void;
}) {
  const {
    reelRate,
    storyRate,
    youtubeVideoRate,
    barterMode,
    instagramAvgReach,
    youtubeAvgViews,
    youtubeConnected,
    updateField,
    prevStep,
  } = useOnboardingStore();

  const validateRate = (rate: number | "", reach: number, minRate: number) => {
    if (rate === "") return null;
    if (rate < minRate)
      return { status: "error", message: `Minimum rate is ₹${minRate}` };

    if (reach > 0) {
      const cpv = rate / reach;
      if (cpv <= 0.2)
        return {
          status: "success",
          message: "✓ Competitive rate — brands will love this!",
        };
      if (cpv <= 0.5)
        return {
          status: "warning",
          message: "⚠ Slightly high — consider adjusting for more applications",
        };
      return {
        status: "error",
        message: "✗ Rate may be too high for your current reach",
      };
    }
    return null;
  };

  const reelValidation = validateRate(reelRate, instagramAvgReach, 500);
  const storyValidation = validateRate(storyRate, instagramAvgReach, 200);
  const ytValidation = youtubeConnected
    ? validateRate(youtubeVideoRate, youtubeAvgViews, 1000)
    : null;

  const isComplete =
    reelRate !== "" &&
    reelRate >= 500 &&
    storyRate !== "" &&
    storyRate >= 200 &&
    (!youtubeConnected ||
      (youtubeVideoRate !== "" && youtubeVideoRate >= 1000));

  const barterOptions = [
    {
      id: "cash_only",
      icon: "💰",
      title: "Cash Only",
      desc: "I only accept monetary payments for my content",
    },
    {
      id: "barter_friendly",
      icon: "🎁",
      title: "Barter Friendly",
      desc: "I'm open to product/value exchanges in place of cash",
    },
    {
      id: "partial_barter",
      icon: "🤝",
      title: "Partial Barter",
      desc: "I prefer a mix of cash + product compensation",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Rate Card & Commercials
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          Determine what campaigns you're open to & specify baseline pricing
          quotes.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
            $ Standard Platform Quotes (INR ₹)
          </label>
          <div className="space-y-4 bg-[var(--bg-card)] p-5 border border-[var(--border-default)] rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 uppercase">
                Instagram Reel *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  value={reelRate}
                  onChange={(e) =>
                    updateField(
                      "reelRate",
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#3B82F6] outline-none"
                />
              </div>
              {reelValidation && (
                <div
                  className={`mt-2 text-xs p-3 rounded-xl border ${reelValidation.status === "success" ? "bg-[#9ece6a]/10 border-[#9ece6a]/20 text-[#9ece6a]" : reelValidation.status === "warning" ? "bg-[#e0af68]/10 border-[#e0af68]/20 text-[#e0af68]" : "bg-[#f7768e]/10 border-[#f7768e]/20 text-[#f7768e]"}`}
                >
                  {reelValidation.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 uppercase">
                Instagram Story *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  value={storyRate}
                  onChange={(e) =>
                    updateField(
                      "storyRate",
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#3B82F6] outline-none"
                />
              </div>
              {storyValidation && (
                <div
                  className={`mt-2 text-xs p-3 rounded-xl border ${storyValidation.status === "success" ? "bg-[#9ece6a]/10 border-[#9ece6a]/20 text-[#9ece6a]" : storyValidation.status === "warning" ? "bg-[#e0af68]/10 border-[#e0af68]/20 text-[#e0af68]" : "bg-[#f7768e]/10 border-[#f7768e]/20 text-[#f7768e]"}`}
                >
                  {storyValidation.message}
                </div>
              )}
            </div>

            {youtubeConnected && (
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 uppercase">
                  YouTube Video *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={youtubeVideoRate}
                    onChange={(e) =>
                      updateField(
                        "youtubeVideoRate",
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#3B82F6] outline-none"
                  />
                </div>
                {ytValidation && (
                  <div
                    className={`mt-2 text-xs p-3 rounded-xl border ${ytValidation.status === "success" ? "bg-[#9ece6a]/10 border-[#9ece6a]/20 text-[#9ece6a]" : ytValidation.status === "warning" ? "bg-[#e0af68]/10 border-[#e0af68]/20 text-[#e0af68]" : "bg-[#f7768e]/10 border-[#f7768e]/20 text-[#f7768e]"}`}
                  >
                    {ytValidation.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
            Barter Acceptability Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barterOptions.map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateField("barterMode", mode.id as any)}
                className={`p-4 rounded-xl text-left flex flex-col gap-1 border transition-all ${barterMode === mode.id ? "bg-[#3B82F6]/10 border-[#3B82F6] shadow-[0_0_15px_rgba(122,162,247,0.15)]" : "bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[#3B82F6]/50"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{mode.icon}</span>
                  <span
                    className={`text-sm font-bold ${barterMode === mode.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {mode.title}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                  {mode.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#9ece6a]/10 border border-[#9ece6a]/20 p-4 rounded-xl flex items-start gap-4 text-xs text-[var(--text-primary)] leading-relaxed">
          <div className="w-10 h-10 rounded-full bg-[#9ece6a]/20 flex items-center justify-center shrink-0">
            <Shield className="text-[#9ece6a]" size={18} />
          </div>
          <div>
            <p className="text-[#9ece6a] font-bold uppercase tracking-wider mb-1">
              SSL Escrow Protected
            </p>
            All payments made on negotiated contracts remain secure in YBEX
            neutral escrow accounts until you submit campaign deliverables
            safely.
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-[var(--border-default)]">
        <button
          onClick={prevStep}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium px-4 py-3 transition"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!isComplete}
          className="bg-[#3B82F6] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Profile →
        </button>
      </div>
    </div>
  );
}
