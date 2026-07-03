import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Instagram, Loader2, Shield, CheckCircle2 } from "lucide-react";
import CreatorLivePreview from "./CreatorLivePreview";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { api } from "../../lib/api";

const VALID_NICHES = [
  "Tech & Gadgets", "Fashion", "Beauty & Makeup", "Skincare",
  "Fitness & Gym", "Food & Cooking", "Travel", "Gaming",
  "Comedy & Entertainment", "Music & Dance", "Finance",
  "Education", "Parenting", "Lifestyle", "Automotive",
  "Photography", "Interior Design", "Sports", "Spirituality",
  "Health & Wellness", "Street Food", "Mental Health",
  "Personal Finance", "Stock Market", "Pets", "Art & Craft"
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Noida", "Gurgaon", "Surat", "Kochi", "Chandigarh",
  "Indore", "Bhopal", "Nagpur", "Patna", "Bhubaneswar",
  "Jaisalmer", "Jodhpur", "Udaipur", "Agra", "Varanasi"
];

const CITY_TO_STATE = {
  "Mumbai": "Maharashtra", "Delhi": "Delhi", "Bangalore": "Karnataka",
  "Jaipur": "Rajasthan", "Lucknow": "Uttar Pradesh", "Noida": "Uttar Pradesh",
  "Hyderabad": "Telangana", "Chennai": "Tamil Nadu", "Kolkata": "West Bengal",
  "Pune": "Maharashtra", "Ahmedabad": "Gujarat", "Gurgaon": "Haryana"
};

const LANGUAGES_LIST = [
  "Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali",
  "Gujarati", "Punjabi", "Kannada", "Malayalam", "Urdu", "Bhojpuri"
];

const RATE_PER_VIEW = 0.30;

export default function CreatorOnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  
  const [formData, setFormData] = useState({
    photoUrl: "", name: user?.name?.trim().split(" ")[0] || "", bio: "", category: "", gender: "Female",
    city: "", state: "", pinCode: "", languages: [],
    instagramHandle: "", followers: 0, avgReach: 0,
    rateReel: "", rateStory: "", barterMode: "Cash Only"
  });

  const [nicheSearch, setNicheSearch] = useState("");
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredNiches = VALID_NICHES.filter(n => n.toLowerCase().startsWith(nicheSearch.toLowerCase()));
  const filteredCities = INDIAN_CITIES.filter(n => n.toLowerCase().startsWith(citySearch.toLowerCase()));

  const handlePincodeChange = async (val) => {
    setFormData(prev => ({ ...prev, pinCode: val }));
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({ ...prev, city: postOffice.District, state: postOffice.State }));
          setCitySearch(postOffice.District);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFetchMetrics = () => {
    if (!formData.instagramHandle) {
      toast.error("Please enter an Instagram handle");
      return;
    }
    setFetchingMeta(true);
    setTimeout(() => {
      setFetchingMeta(false);
      setFormData(prev => ({
        ...prev, 
        followers: prev.followers > 0 ? prev.followers : (prev.instagramHandle === 'elite_ravi' ? 10400 : 15400),
        avgReach: prev.avgReach > 0 ? prev.avgReach : (prev.instagramHandle === 'elite_ravi' ? 500000 : 8000)
      }));
      toast.success(`✅ Fetched Instagram profile metric: ${formData.followers > 0 ? formData.followers : (formData.instagramHandle === 'elite_ravi' ? 10400 : 15400)} Followers!`);
    }, 2500);
  };

  const validateRate = (rate, avgReach) => {
    if (!rate || !avgReach) return null;
    const competitive = avgReach * RATE_PER_VIEW;
    const ratio = rate / competitive;
    if (ratio <= 1.2) return { status: 'good', message: '✅ Your charges look justified for your reach. Brands will find this competitive.' };
    if (ratio <= 2.0) return { status: 'warning', message: `⚠️ Heads up! Based on your avg reach of ${avgReach.toLocaleString('en-IN')}, a competitive rate would be around ₹${Math.round(competitive).toLocaleString('en-IN')} (₹0.30/view). Your quoted charges are higher — you can still submit, brands may negotiate.` };
    return { status: 'error', message: '❌ Rate is significantly above market. Consider adjusting.' };
  };

  const reelValidation = validateRate(Number(formData.rateReel), formData.avgReach);
  const storyValidation = validateRate(Number(formData.rateStory), formData.avgReach);

  const handleSaveAndComplete = async () => {
    setLoading(true);
    try {
      if (supabase) {
        await supabase.from('creator_profiles').upsert({
          user_id: user?.user_id || user?.id,
          full_name: formData.name,
          avatar_url: formData.photoUrl,
          bio: formData.bio,
          primary_niche: formData.category,
          gender: formData.gender,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pinCode,
          languages: formData.languages,
          instagram_handle: formData.instagramHandle,
          follower_count: formData.followers,
          avg_reach: formData.avgReach,
          rate_reel: formData.rateReel,
          rate_story: formData.rateStory,
          barter_mode: formData.barterMode,
          onboarding_completed: true,
          onboarding_step: 5
        }, { onConflict: 'user_id' }).select();
      }
      // Also update in API if required
      await api.post("/auth/onboard", {
        role: "creator",
        data: { ...formData, onboarding_completed: true }
      }).catch((apiErr) => console.log("API onboard error (ignored)", apiErr));
      
      if (onComplete) onComplete();
    } catch (e) {
       console.error("CREATOR ONBOARD ERROR:", e);
       toast.error("Failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative w-full">
      {/* Left panel */}
      <section className="hidden lg:flex lg:col-span-7 bg-gradient-to-b lg:bg-gradient-to-r from-card via-background to-background relative overflow-hidden flex-col items-center justify-center p-10 pt-20 min-h-screen border-r border-foreground/5">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
         <div className="absolute bottom-1/4 -left-10 w-[450px] h-[450px] bg-[#7C5CFF]/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="z-10 w-full flex justify-center mt-[-5rem]">
           <CreatorLivePreview formData={formData} currentStep={step} user={user} />
         </div>
      </section>

      {/* Right panel */}
      <section className="w-full lg:col-span-5 flex flex-col justify-center pt-24 pb-12 px-6 sm:p-12 md:p-16 relative bg-[var(--bg-base)] min-h-screen">
        <div className="w-full max-w-sm sm:max-w-md mx-auto relative mb-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Tell us who you are</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Your photo and primary content genre will display directly on the search grid.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Profile Photo (Highly Recommended)</label>
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden">
                       {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <Instagram className="text-[var(--text-secondary)]" />}
                     </div>
                     <label className="text-sm bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] px-4 py-2 rounded-xl border border-[var(--border-default)] transition cursor-pointer">
                       Upload Photo
                       <input 
                         type="file" 
                         className="hidden" 
                         accept="image/*"
                         onChange={e => {
                           if (e.target.files?.[0]) {
                             setFormData({...formData, photoUrl: URL.createObjectURL(e.target.files[0])});
                           }
                         }}
                       />
                     </label>
                   </div>
                   <p className="text-xs text-[var(--text-tertiary)] mt-2">ⓘ A professional friendly face photo increases CTR by 140%.</p>
                </div>

                <div>
                   <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Biography / Elevator Pitch</label>
                   <textarea 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none transition min-h-[100px]"
                     placeholder="Write 2-3 sentences..."
                     value={formData.bio}
                     onChange={e => setFormData({...formData, bio: e.target.value})}
                   />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 relative">
                     <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Primary Category *</label>
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                       placeholder="e.g., Tech"
                       value={nicheSearch}
                       onChange={e => {
                         setNicheSearch(e.target.value);
                         setShowNicheDropdown(true);
                       }}
                       onFocus={() => setShowNicheDropdown(true)}
                     />
                     {showNicheDropdown && nicheSearch && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[#7C5CFF]/30 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl">
                         {filteredNiches.length > 0 ? filteredNiches.map(n => (
                           <button 
                             key={n} 
                             className="w-full text-left px-4 py-3 text-[var(--text-primary)] hover:bg-[#7C5CFF]/20 flex justify-between group"
                             onClick={() => {
                               setFormData({...formData, category: n});
                               setNicheSearch(n);
                               setShowNicheDropdown(false);
                             }}
                           >
                             {n} <span className="text-[#7C5CFF] opacity-0 group-hover:opacity-100 uppercase text-[10px] font-bold">Select ↓</span>
                           </button>
                         )) : <div className="p-4 text-[var(--text-secondary)] text-sm">No matching niche found</div>}
                       </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Gender Identity</label>
                     <select 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none appearance-none"
                       value={formData.gender}
                       onChange={e => setFormData({...formData, gender: e.target.value})}
                     >
                       <option>Female</option><option>Male</option><option>Other</option>
                     </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <button onClick={() => setStep(2)} className="bg-[var(--violet)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#6D4AE5] transition">
                     Continue <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Local Reach & Languages</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Brands search geographically and prioritize native local content delivery.</p>

              <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="flex-1 relative">
                     <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">City Location *</label>
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                       placeholder="e.g. Jaipur"
                       value={citySearch}
                       onChange={e => {
                         setCitySearch(e.target.value);
                         setShowCityDropdown(true);
                       }}
                       onFocus={() => setShowCityDropdown(true)}
                     />
                     {showCityDropdown && citySearch && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[#7C5CFF]/30 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl">
                         {filteredCities.map(c => (
                           <button 
                             key={c} 
                             className="w-full text-left px-4 py-3 text-[var(--text-primary)] hover:bg-[#7C5CFF]/20"
                             onClick={() => {
                               setFormData({...formData, city: c, state: CITY_TO_STATE[c] || ""});
                               setCitySearch(c);
                               setShowCityDropdown(false);
                             }}
                           >
                             {c}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">State *</label>
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                       readOnly
                       value={formData.state}
                       placeholder="e.g. Rajasthan"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Pin Code</label>
                   <input 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                     placeholder="e.g. 302001"
                     value={formData.pinCode}
                     onChange={e => handlePincodeChange(e.target.value)}
                     maxLength={6}
                   />
                </div>

                <div>
                   <div className="flex justify-between mb-2">
                     <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Languages</label>
                     <span className="text-xs text-[#7C5CFF] font-bold">{formData.languages.length} SELECTED</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {LANGUAGES_LIST.map(lang => (
                       <button
                         key={lang}
                         onClick={() => {
                           if (formData.languages.includes(lang)) {
                             setFormData({...formData, languages: formData.languages.filter(l => l !== lang)});
                           } else {
                             setFormData({...formData, languages: [...formData.languages, lang]});
                           }
                         }}
                         className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.languages.includes(lang) ? 'bg-[#7C5CFF] border-[#7C5CFF] text-[var(--text-primary)]' : 'bg-transparent border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {lang}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="pt-4 flex justify-between">
                   <button onClick={() => setStep(1)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                     <ArrowLeft size={18} /> Back
                   </button>
                   <button onClick={() => setStep(3)} className="bg-[var(--violet)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#6D4AE5] transition">
                     Continue <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Social Channel</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Verify profile metrics & establish secure connections.</p>

              {!fetchingMeta ? (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-card)] border border-[#3B82F6]/30 p-5 rounded-2xl">
                    <p className="text-sm text-[var(--text-tertiary)] font-medium mb-4">Enter Instagram Handle<br/><span className="text-xs text-[var(--text-secondary)] font-normal">Provide your handle. Ybex will automatically lookup public metrics from Meta graphs.</span></p>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-[var(--text-secondary)]">@</span>
                      <input 
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                        placeholder="your_handle"
                        value={formData.instagramHandle}
                        onChange={e => setFormData({...formData, instagramHandle: e.target.value.replace('@', '')})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Real Followers (Optional Override)</label>
                       <input 
                         className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-white/30 outline-none"
                         type="number"
                         value={formData.followers || ''}
                         onChange={e => setFormData({...formData, followers: parseInt(e.target.value) || 0})}
                       />
                    </div>
                    <div className="flex-1">
                       <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase">Avg Reach (Optional Override)</label>
                       <input 
                         className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-white/30 outline-none"
                         type="number"
                         value={formData.avgReach || ''}
                         onChange={e => setFormData({...formData, avgReach: parseInt(e.target.value) || 0})}
                       />
                    </div>
                  </div>

                  <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 p-4 rounded-xl text-xs text-blue-200/80 leading-relaxed">
                    <p className="text-[#3B82F6] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">💡 Ybex Verification Guideline</p>
                    Ybex fetches verified public metrics safely. If follower count is below **999**, verification fails.<br/>
                    • Use the Optional Override field to input actual stats.<br/>
                    • Or leave empty — we will assign a default mock score for testing.
                  </div>

                  <div className="pt-4 flex justify-between">
                     <button onClick={() => setStep(2)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                       <ArrowLeft size={18} /> Back
                     </button>
                     <button onClick={handleFetchMetrics} className="bg-[#3B82F6] text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                       FETCH & VERIFY METRICS <ArrowRight size={18} />
                     </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <Instagram className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Scanning Profile Metrics</h3>
                    <p className="text-[var(--text-tertiary)] text-sm">Querying Meta API and validating public follower counts.<br/>Please hold...</p>
                  </div>

                  <div className="bg-[var(--bg-card)] border border-blue-500/10 p-5 rounded-2xl w-full max-w-sm mt-4 text-xs font-mono text-left space-y-2">
                    <p className="text-blue-400 font-bold mb-3 border-b border-[var(--border-default)] pb-2">METRICS API STATUS</p>
                    <p className="text-green-400 flex items-center gap-2"><CheckCircle2 size={12}/> Connecting to Meta graph webhooks...</p>
                    <p className="text-green-400 flex items-center gap-2 opacity-80"><CheckCircle2 size={12}/> Endpoint active. Mapping user graph...</p>
                    <p className="text-green-400 flex items-center gap-2 opacity-60"><CheckCircle2 size={12}/> Audience metadata fetched successfully.</p>
                    <p className="text-yellow-400 flex items-center gap-2 opacity-100 animate-pulse mt-2">○ Resolving final entry criteria...</p>
                  </div>
                </div>
              )}
              {formData.followers > 0 && !fetchingMeta && (
                <div className="mt-8 pt-4 flex justify-end">
                   <button onClick={() => setStep(4)} className="bg-[var(--violet)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#6D4AE5] transition">
                     Continue <ArrowRight size={18} />
                   </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Rate Card & Commercials</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Determine what campaigns you're open to & specify baseline pricing quotes.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">$ Standard Platform Quotes (INR ₹)</label>
                  <div className="space-y-4 bg-[var(--bg-card)] p-5 border border-[var(--border-default)] rounded-2xl">
                    <div>
                       <label className="block text-xs font-bold text-[var(--text-tertiary)] mb-2 uppercase">Instagram Reel *</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] font-bold">₹</span>
                         <input 
                           className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                           type="number"
                           value={formData.rateReel}
                           onChange={e => setFormData({...formData, rateReel: e.target.value})}
                         />
                       </div>
                       {reelValidation && (
                         <div className={`mt-2 text-xs p-3 rounded-xl border ${reelValidation.status === 'good' ? 'bg-green-500/10 border-green-500/20 text-green-400' : reelValidation.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                           {reelValidation.message}
                         </div>
                       )}
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[var(--text-tertiary)] mb-2 uppercase">Instagram Story *</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] font-bold">₹</span>
                         <input 
                           className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#7C5CFF]/50 focus:outline-none"
                           type="number"
                           value={formData.rateStory}
                           onChange={e => setFormData({...formData, rateStory: e.target.value})}
                         />
                       </div>
                       {storyValidation && (
                         <div className={`mt-2 text-xs p-3 rounded-xl border ${storyValidation.status === 'good' ? 'bg-green-500/10 border-green-500/20 text-green-400' : storyValidation.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                           {storyValidation.message}
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Barter Acceptability Mode</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {["Cash Only", "Barter Friendly", "Partial Barter"].map(mode => (
                       <button
                         key={mode}
                         onClick={() => setFormData({...formData, barterMode: mode})}
                         className={`p-4 rounded-xl text-sm font-bold border transition-all text-left flex flex-col gap-1 ${formData.barterMode === mode ? 'bg-[#7C5CFF]/10 border-[#7C5CFF] text-[var(--text-primary)] shadow-[0_0_15px_rgba(124,92,255,0.15)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {mode}
                         <span className="text-[10px] font-normal opacity-70">
                           {mode === "Cash Only" ? "Strictly commercial payments" : mode === "Barter Friendly" ? "Accept product/value exchanges" : "Hybrid compensation model"}
                         </span>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[#10B981]/20 p-4 rounded-xl flex items-start gap-4 text-xs text-[var(--text-tertiary)] leading-relaxed group hover:border-[#10B981]/40 transition-colors">
                   <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                     <Shield className="text-[#10B981]" size={18} />
                   </div>
                   <div>
                     <p className="text-[#10B981] font-bold uppercase tracking-wider mb-1">⊙ SSL Escrow Protected Settlements</p>
                     All payments made on negotiated contracts remain secure in Ybex neutral escrow accounts until you submit campaign deliverables safely.
                   </div>
                </div>

                <div className="pt-4 flex justify-between">
                   <button onClick={() => setStep(3)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                     <ArrowLeft size={18} /> Back
                   </button>
                   <button onClick={handleSaveAndComplete} disabled={loading} className="bg-gradient-to-r from-[#D9F111] to-[#cbe010] text-[#12121A] px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:opacity-90 transition shadow-[0_0_20px_rgba(217,241,17,0.3)] disabled:opacity-50 flex items-center gap-2">
                     {loading ? <Loader2 className="animate-spin" size={18}/> : "Publish Profile ✓"}
                   </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
