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
        <h2 className="text-3xl font-bold text-[#c0caf5]">
          Local Reach & Languages
        </h2>
        <p className="text-[#565f89] mt-2">
          Brands search geographically and prioritize native local content
          delivery.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
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
              className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
            />
            {showCityDropdown && citySearch !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#24283b] border border-[#565f89]/50 rounded-xl max-h-60 overflow-y-auto z-50 shadow-xl p-2 custom-scrollbar">
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      updateField("city", c);
                      updateField("state", "Maharashtra");
                      setCitySearch(c);
                      setShowCityDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#c0caf5] hover:bg-[#7aa2f7]/20 rounded-lg transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
              State *
            </label>
            <input
              type="text"
              value={state}
              readOnly
              placeholder="e.g. Maharashtra"
              className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5]/60 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#565f89] mb-2 uppercase">
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
              className="w-full bg-[#1a1b26] border border-[#565f89]/50 rounded-xl p-3.5 text-[#c0caf5] focus:border-[#7aa2f7] outline-none"
            />
            {fetchingPin && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-[#7aa2f7]" size={18} />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-[#565f89] uppercase">
              Languages *
            </label>
            <span className="text-xs text-[#7aa2f7] font-medium">
              {languages.length} Selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${languages.includes(lang) ? "bg-[#7aa2f7]/20 border-[#7aa2f7] text-[#7aa2f7]" : "bg-[#1a1b26] border-[#565f89]/50 text-[#c0caf5] hover:border-[#7aa2f7]/50"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
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
          disabled={!isComplete}
          className="bg-[#7aa2f7] text-[#1a1b26] font-bold py-3 px-8 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Social →
        </button>
      </div>
    </div>
  );
}
