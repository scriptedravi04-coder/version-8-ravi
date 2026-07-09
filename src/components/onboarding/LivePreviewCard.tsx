import React from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { MapPin, Instagram, Youtube, Sparkles } from "lucide-react";

export default function LivePreviewCard() {
  const {
    fullName,
    instagramHandle,
    dobDay,
    dobMonth,
    dobYear,
    photoUrl,
    bio,
    primaryNiche,
    city,
    state,
    languages,
    followerCount,
    youtubeSubscribers,
    reelRate,
    barterMode,
    youtubeConnected,
  } = useOnboardingStore();

  const calculateAge = () => {
    if (!dobDay || !dobMonth || !dobYear || dobYear.length < 4) return null;
    const dob = new Date(`${dobYear}-${dobMonth}-${dobDay}`);
    if (isNaN(dob.getTime())) return null;
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  const age = calculateAge();

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getBarterModeText = () => {
    switch (barterMode) {
      case "cash_only":
        return "💰 Cash Only";
      case "barter_friendly":
        return "🎁 Barter Friendly";
      case "partial_barter":
        return "🤝 Partial Barter";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-[#24283b] rounded-[2rem] border border-[#7aa2f7]/30 shadow-[0_0_30px_rgba(122,162,247,0.1)] relative overflow-hidden flex flex-col h-[650px] md:h-auto">
      {/* Header Pattern */}
      <div className="h-32 bg-gradient-to-br from-[#7aa2f7]/20 to-[#1a1b26] relative">
        <div className="absolute top-4 right-4 bg-[#1a1b26]/50 backdrop-blur text-[#c0caf5] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#565f89]/30">
          LIVE PREVIEW
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8 relative flex-1 flex flex-col">
        {/* Profile Image */}
        <div className="w-24 h-24 rounded-full border-4 border-[#24283b] bg-[#1a1b26] -mt-12 mx-auto overflow-hidden shrink-0 shadow-lg relative z-10 flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#565f89] text-xs font-medium">No Photo</span>
          )}
        </div>

        <div className="text-center mt-4">
          <h3 className="text-xl font-bold text-[#c0caf5]">
            {fullName || "Your Name"}
          </h3>
          <p className="text-[#7aa2f7] text-sm font-medium">
            @{instagramHandle || "instagram_handle"}
          </p>
        </div>

        {primaryNiche && primaryNiche.length > 0 && (
          <div className="flex justify-center mt-3 flex-wrap gap-2 px-4">
            {Array.isArray(primaryNiche) ? (
              primaryNiche.slice(0, 3).map((n) => (
                <span
                  key={n}
                  className="bg-[#1a1b26] border border-[#7aa2f7]/30 text-[#7aa2f7] text-[10px] font-bold px-2 py-1 rounded-full"
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="bg-[#1a1b26] border border-[#7aa2f7]/30 text-[#7aa2f7] text-[10px] font-bold px-2 py-1 rounded-full">
                {primaryNiche}
              </span>
            )}
          </div>
        )}

        {(city || state || age) && (
          <div className="flex items-center justify-center gap-2 mt-3 text-[#565f89] text-xs font-medium flex-wrap">
            {age && (
              <span className="bg-[#1a1b26] px-2 py-0.5 rounded-md border border-[#565f89]/20">
                {age} yrs
              </span>
            )}
            {(city || state) && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {city ? `${city}${state ? ", " + state : ""}` : state}
              </span>
            )}
          </div>
        )}

        {bio && (
          <div className="mt-4 text-[#c0caf5]/80 text-sm text-center italic line-clamp-3 leading-relaxed px-2">
            "{bio}"
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          {followerCount > 0 && (
            <div className="flex flex-col items-center bg-[#1a1b26] p-3 rounded-2xl border border-[#565f89]/20 w-24">
              <Instagram size={16} className="text-[#e0af68] mb-1" />
              <span className="font-bold text-[#c0caf5]">
                {formatNumber(followerCount)}
              </span>
              <span className="text-[10px] text-[#565f89] uppercase tracking-wider">
                Followers
              </span>
            </div>
          )}
          {youtubeConnected && youtubeSubscribers > 0 && (
            <div className="flex flex-col items-center bg-[#1a1b26] p-3 rounded-2xl border border-[#565f89]/20 w-24">
              <Youtube size={16} className="text-[#f7768e] mb-1" />
              <span className="font-bold text-[#c0caf5]">
                {formatNumber(youtubeSubscribers)}
              </span>
              <span className="text-[10px] text-[#565f89] uppercase tracking-wider">
                Subs
              </span>
            </div>
          )}
        </div>

        {languages.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {languages.slice(0, 4).map((l) => (
              <span
                key={l}
                className="text-[10px] text-[#c0caf5] bg-[#565f89]/20 px-2 py-1 rounded-md"
              >
                {l}
              </span>
            ))}
            {languages.length > 4 && (
              <span className="text-[10px] text-[#565f89] bg-[#1a1b26] px-2 py-1 rounded-md border border-[#565f89]/30">
                +{languages.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="bg-[#1a1b26] rounded-xl p-4 border border-[#565f89]/20 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#565f89] uppercase font-bold tracking-wider mb-1">
                Starting from
              </p>
              <p className="text-lg font-bold text-[#9ece6a]">
                {reelRate ? `₹${reelRate}` : "---"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#c0caf5] bg-[#565f89]/30 px-3 py-1.5 rounded-lg border border-[#565f89]/50">
                {getBarterModeText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-1 right-1 opacity-10 pointer-events-none">
        <Sparkles size={100} />
      </div>
    </div>
  );
}
