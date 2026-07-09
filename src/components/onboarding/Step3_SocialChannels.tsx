import React, { useState } from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import {
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Step3_SocialChannels({ user }: { user: any }) {
  const {
    instagramHandle,
    followerCount,
    instagramAvgReach,
    youtubeConnected,
    youtubeChannelUrl,
    youtubeSubscribers,
    youtubeAvgViews,
    otherPlatforms,
    updateField,
    updateOtherPlatform,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const [showOthers, setShowOthers] = useState(
    !!otherPlatforms.twitter || !!otherPlatforms.linkedin
  );

  const isIgComplete =
    instagramHandle && followerCount > 0 && instagramAvgReach > 0;
  const isIgWarning = isIgComplete && followerCount < 1000;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-[#c0caf5]">Social Channels</h2>
        <p className="text-[#565f89] mt-2">
          Connect your profiles to verify metrics and establish secure connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram Manual Form */}
        <div className="bg-[#24283b] rounded-2xl border border-transparent bg-clip-padding relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-2xl -m-[1px] -z-10 opacity-30"></div>
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Instagram size={24} className="text-[#e0af68]" />
                <h3 className="font-bold text-[#c0caf5] text-lg">
                  Instagram <span className="text-[#f7768e] text-sm">*</span>
                </h3>
              </div>
              {isIgComplete && (
                <span className="bg-[#9ece6a]/20 text-[#9ece6a] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Connected
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs font-medium text-[#565f89] mb-1 block">
                  Instagram Link or Handle
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => updateField("instagramHandle", e.target.value)}
                  className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                  placeholder="instagram.com/username or @username"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#565f89] mb-1 block">
                    Current Followers
                  </label>
                  <input
                    type="number"
                    value={followerCount || ""}
                    onChange={(e) =>
                      updateField("followerCount", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                    placeholder="e.g. 10000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#565f89] mb-1 block">
                    Current Avg Reach
                  </label>
                  <input
                    type="number"
                    value={instagramAvgReach || ""}
                    onChange={(e) =>
                      updateField("instagramAvgReach", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
            </div>

            {isIgWarning && (
              <div className="mt-4 flex items-start gap-2 bg-[#e0af68]/10 text-[#e0af68] p-3 rounded-lg text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  Most brands require 1,000+ followers for paid collabs. You can
                  still join for barter deals!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* YouTube Manual Form */}
        <div className="bg-[#24283b] rounded-2xl border border-transparent bg-clip-padding relative">
          <div className="absolute inset-0 bg-[#ff0000] rounded-2xl -m-[1px] -z-10 opacity-20"></div>
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Youtube size={24} className="text-[#f7768e]" />
                <h3 className="font-bold text-[#c0caf5] text-lg">YouTube</h3>
              </div>
              {youtubeChannelUrl && youtubeSubscribers > 0 && (
                <span className="bg-[#9ece6a]/20 text-[#9ece6a] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Connected
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs font-medium text-[#565f89] mb-1 block">
                  Channel URL
                </label>
                <input
                  type="text"
                  value={youtubeChannelUrl}
                  onChange={(e) => updateField("youtubeChannelUrl", e.target.value)}
                  className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                  placeholder="youtube.com/@channel"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#565f89] mb-1 block">
                    Subscribers
                  </label>
                  <input
                    type="number"
                    value={youtubeSubscribers || ""}
                    onChange={(e) =>
                      updateField("youtubeSubscribers", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                    placeholder="e.g. 10000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#565f89] mb-1 block">
                    Avg Views
                  </label>
                  <input
                    type="number"
                    value={youtubeAvgViews || ""}
                    onChange={(e) =>
                      updateField("youtubeAvgViews", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[#565f89]/30 rounded-2xl overflow-hidden bg-[#24283b]">
        <button
          onClick={() => setShowOthers(!showOthers)}
          className="w-full p-4 flex justify-between items-center text-[#c0caf5] font-bold bg-[#1a1b26]/50 hover:bg-[#1a1b26] transition"
        >
          <span>+ Add more platforms (optional)</span>
          {showOthers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
          {showOthers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs font-medium text-[#565f89] mb-1 block flex items-center gap-1">
                  <Twitter size={14} /> Twitter / X
                </label>
                <input
                  type="text"
                  value={otherPlatforms.twitter || ""}
                  onChange={(e) =>
                    updateOtherPlatform("twitter", e.target.value)
                  }
                  className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                  placeholder="@handle"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#565f89] mb-1 block flex items-center gap-1">
                  <Linkedin size={14} /> LinkedIn
                </label>
                <input
                  type="text"
                  value={otherPlatforms.linkedin || ""}
                  onChange={(e) =>
                    updateOtherPlatform("linkedin", e.target.value)
                  }
                  className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-lg p-2.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
                  placeholder="Profile URL"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between pt-6 border-t border-[#565f89]/20">
        <button
          onClick={prevStep}
          className="text-[#565f89] hover:text-[#c0caf5] font-medium px-4 py-3 transition"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!isIgComplete}
          className="bg-[#7aa2f7] text-[#1a1b26] font-bold py-3 px-8 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Rate Card →
        </button>
      </div>
    </div>
  );
}
