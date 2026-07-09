import React, { useState, useRef } from "react";
import { Camera, Loader2, AlertCircle, X } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { uploadProfilePhoto } from "../../api/onboarding";

const CATEGORIES = [
  "Finance & Investing",
  "Technology",
  "Fashion",
  "Beauty",
  "Travel",
  "Food",
  "Fitness & Health",
  "Gaming",
  "Education",
  "Lifestyle",
  "Comedy",
  "Art & Design",
  "Music",
  "Dance",
  "Spiritual & Wellness",
  "Real Estate",
  "Sports",
  "Business & Startups",
];

export default function Step1_Identity({ user }: { user: any }) {
  const {
    fullName,
    instagramHandle,
    dobDay,
    dobMonth,
    dobYear,
    photoUrl,
    bio,
    primaryNiche,
    gender,
    updateField,
    nextStep,
  } = useOnboardingStore();

  const [nicheSearch, setNicheSearch] = useState("");
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    const url = await uploadProfilePhoto(user.id, e.target.files[0]);
    if (url) {
      updateField("photoUrl", url);
    }
    setUploadingImage(false);
  };

  const calculateAge = () => {
    if (!dobDay || !dobMonth || !dobYear || dobYear.length < 4) return null;
    const dob = new Date(`${dobYear}-${dobMonth}-${dobDay}`);
    if (isNaN(dob.getTime())) return null;
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge();
  const isUnderage = age !== null && age < 18;
  const isComplete =
    fullName &&
    instagramHandle &&
    !isUnderage &&
    dobDay &&
    dobMonth &&
    dobYear &&
    primaryNiche &&
    primaryNiche.length > 0 &&
    gender;

  const currentNiches = Array.isArray(primaryNiche)
    ? primaryNiche
    : primaryNiche
      ? [primaryNiche]
      : [];
  const filteredNiches = CATEGORIES.filter(
    (c) =>
      c.toLowerCase().includes(nicheSearch.toLowerCase()) &&
      !currentNiches.includes(c),
  );

  const handleDobChange = (
    field: "dobDay" | "dobMonth" | "dobYear",
    val: string,
  ) => {
    const numVal = val.replace(/\D/g, "");
    updateField(field, numVal);

    if (field === "dobDay" && numVal.length === 2) {
      monthRef.current?.focus();
    }
    if (field === "dobMonth" && numVal.length === 2) {
      yearRef.current?.focus();
    }
  };

  const toggleCategory = (cat: string) => {
    if (currentNiches.includes(cat)) {
      updateField(
        "primaryNiche",
        currentNiches.filter((c) => c !== cat),
      );
    } else {
      updateField("primaryNiche", [...currentNiches, cat]);
    }
    setNicheSearch("");
    setShowNicheDropdown(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-[#c0caf5] mb-2">
          Create your Creator Profile
        </h2>
        <p className="text-[#565f89]">
          Set up your identity on YBEX so brands can discover you.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-[#565f89]/20">
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-20 h-20 rounded-full border border-dashed border-[#565f89] flex items-center justify-center overflow-hidden bg-[#24283b]">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera
                  size={24}
                  className="text-[#565f89] group-hover:text-[#7aa2f7] transition"
                />
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#c0caf5]">Profile Photo</h4>
            <p className="text-xs text-[#565f89] mt-1">
              📸 Profile photo increases CTR by 140%
            </p>
            <p className="text-xs text-[#565f89] mt-1">
              Recommended size: 500x500px, under 2MB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
              Display Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              maxLength={50}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] focus:ring-1 focus:ring-[#7aa2f7] outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
              Instagram Handle *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565f89] font-medium">
                @
              </span>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) =>
                  updateField(
                    "instagramHandle",
                    e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""),
                  )
                }
                placeholder="your_handle"
                className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 pl-8 text-[#c0caf5] focus:border-[#7aa2f7] outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
              Date of Birth *
            </label>
            <div className="flex gap-2">
              <input
                ref={dayRef}
                type="text"
                placeholder="DD"
                value={dobDay}
                onChange={(e) => handleDobChange("dobDay", e.target.value)}
                maxLength={2}
                className="w-1/3 bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none text-center"
              />
              <input
                ref={monthRef}
                type="text"
                placeholder="MM"
                value={dobMonth}
                onChange={(e) => handleDobChange("dobMonth", e.target.value)}
                maxLength={2}
                className="w-1/3 bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none text-center"
              />
              <input
                ref={yearRef}
                type="text"
                placeholder="YYYY"
                value={dobYear}
                onChange={(e) => handleDobChange("dobYear", e.target.value)}
                maxLength={4}
                className="w-1/3 bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none text-center"
              />
            </div>
            {isUnderage && (
              <p className="text-xs text-[#f7768e] mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> You must be 18+ to join YBEX
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
              Gender Identity *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Female", "Male", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => updateField("gender", g)}
                  className={`py-3.5 px-2 rounded-xl border text-sm font-bold transition-all ${gender === g ? "bg-[#7aa2f7] text-[#1a1b26] border-[#7aa2f7]" : "bg-[#1a1b26] text-[#565f89] border-[#565f89]/50 hover:border-[#7aa2f7]/50"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
            Primary Categories / Niches *
          </label>
          <div className="min-h-[50px] p-2 bg-[#1a1b26] border border-[#565f89]/50 rounded-xl flex flex-wrap gap-2 focus-within:border-[#7aa2f7] transition">
            {currentNiches.map((n: string) => (
              <span
                key={n}
                className="flex items-center gap-1 bg-[#7aa2f7]/20 text-[#7aa2f7] px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {n}
                <button
                  onClick={() => toggleCategory(n)}
                  className="hover:text-[#f7768e] ml-1"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={nicheSearch}
              onChange={(e) => {
                setNicheSearch(e.target.value);
                setShowNicheDropdown(true);
              }}
              onFocus={() => setShowNicheDropdown(true)}
              onBlur={() => setTimeout(() => setShowNicheDropdown(false), 200)}
              placeholder={
                currentNiches.length === 0 ? "Search categories..." : ""
              }
              className="flex-1 bg-transparent outline-none text-[#c0caf5] min-w-[120px] p-1.5"
            />
          </div>
          {showNicheDropdown &&
            nicheSearch !== "" &&
            filteredNiches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#24283b] border border-[#565f89]/50 rounded-xl max-h-60 overflow-y-auto z-50 shadow-xl p-2 custom-scrollbar">
                {filteredNiches.map((n) => (
                  <button
                    key={n}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleCategory(n);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#c0caf5] hover:bg-[#7aa2f7]/20 rounded-lg transition"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-[#565f89] uppercase">
              Biography / Elevator Pitch
            </label>
            <span className="text-xs text-[#565f89]">{bio.length}/300</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) =>
              updateField("bio", e.target.value.substring(0, 300))
            }
            placeholder="Tell brands about your content style and audience in 2-3 sentences..."
            className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-4 text-[#c0caf5] focus:border-[#7aa2f7] outline-none min-h-[100px] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-[#565f89]/20">
        <button
          onClick={nextStep}
          disabled={!isComplete}
          className="bg-[#7aa2f7] text-[#1a1b26] font-bold py-3 px-8 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Demographics →
        </button>
      </div>
    </div>
  );
}
