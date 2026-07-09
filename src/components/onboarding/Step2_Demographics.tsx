import React, { useState } from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { fetchPinCodeDetails } from "../../api/onboarding";
import { Loader2 } from "lucide-react";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Noida",
  "Gurgaon",
  "Surat",
  "Kochi",
  "Chandigarh",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Patna",
  "Bhubaneswar",
];
const LANGUAGES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Urdu",
  "Bhojpuri",
];

export default function Step2_Demographics({ user }: { user: any }) {
  const { city, state, pinCode, languages, updateField, nextStep, prevStep } =
    useOnboardingStore();

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [fetchingPin, setFetchingPin] = useState(false);

  const handlePincodeChange = async (val: string) => {
    updateField("pinCode", val);
    if (val.length === 6) {
      setFetchingPin(true);
      const details = await fetchPinCodeDetails(val);
      if (details) {
        updateField("city", details.city);
        updateField("state", details.state);
        setCitySearch(details.city);
      }
      setFetchingPin(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      updateField(
        "languages",
        languages.filter((l) => l !== lang),
      );
    } else {
      updateField("languages", [...languages, lang]);
    }
  };

  const isComplete =
    city && state && pinCode.length === 6 && languages.length > 0;
  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Local Reach & Languages
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          Brands search geographically and prioritize native local content
          delivery.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">
              City *
            </label>
            <input
              type="text"
              value={citySearch || city}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder="e.g. Mumbai"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] focus:border-[#3B82F6] outline-none"
            />
            {showCityDropdown && citySearch !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl max-h-60 overflow-y-auto z-50 shadow-xl p-2 custom-scrollbar">
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      updateField("city", c);
                      updateField("state", "Maharashtra");
                      setCitySearch(c);
                      setShowCityDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[#3B82F6]/20 rounded-lg transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">
              State *
            </label>
            <input
              type="text"
              value={state}
              readOnly
              placeholder="e.g. Maharashtra"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)]/60 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">
            Pin Code *
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={pinCode}
              onChange={(e) =>
                handlePincodeChange(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="e.g. 400001"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-3.5 text-[var(--text-primary)] focus:border-[#3B82F6] outline-none"
            />
            {fetchingPin && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-[#3B82F6]" size={18} />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">
              Languages *
            </label>
            <span className="text-xs text-[#3B82F6] font-medium">
              {languages.length} Selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${languages.includes(lang) ? "bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]" : "bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#3B82F6]/50"}`}
              >
                {lang}
              </button>
            ))}
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
          onClick={nextStep}
          disabled={!isComplete}
          className="bg-[#3B82F6] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Social →
        </button>
      </div>
    </div>
  );
}
