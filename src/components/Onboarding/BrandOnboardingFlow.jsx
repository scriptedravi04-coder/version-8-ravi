import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Shield, Building2 } from "lucide-react";
import BrandLivePreview from "./BrandLivePreview";
import AIGenerateButton from "../shared/AIGenerateButton";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { api } from "../../lib/api";

const VALID_NICHES = [
  "Fashion & Apparel", "Beauty & Cosmetics", "Tech & Gadgets", "Food & Beverage",
  "Travel & Tourism", "Fitness & Health", "Gaming & E-Sports", "Lifestyle",
  "Automotive", "Education", "Real Estate", "Finance & Fintech", "Entertainment",
  "Home & Decor", "Pet Care", "Childcare & Parenting", "Software & SaaS", "Retail",
  "Hospitality", "Sports & Outdoors", "Jewelry & Accessories"
];

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Noida", "Gurgaon", "Surat", "Kochi", "Chandigarh",
  "Indore", "Bhopal", "Nagpur", "Patna", "Bhubaneswar",
  "Navi Mumbai", "Thane", "Faridabad", "Ghaziabad"
];

const CITY_TO_STATE = {
  "Mumbai": "Maharashtra", "Delhi": "Delhi", "Bangalore": "Karnataka",
  "Jaipur": "Rajasthan", "Lucknow": "Uttar Pradesh", "Noida": "Uttar Pradesh",
  "Hyderabad": "Telangana", "Chennai": "Tamil Nadu", "Kolkata": "West Bengal",
  "Pune": "Maharashtra", "Ahmedabad": "Gujarat", "Gurgaon": "Haryana",
  "Navi Mumbai": "Maharashtra", "Thane": "Maharashtra", "Faridabad": "Haryana", "Ghaziabad": "Uttar Pradesh"
};

export default function BrandOnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: user?.name || "", logoUrl: "", industry: "", description: "", genderFocus: "All",
    websiteUrl: "", socialHandle: "", teamSize: "11-50", city: "", state: "", pinCode: "",
    campaignTypes: [], budgetRange: "", creatorSize: "", niches: ""
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

  const handleSaveAndComplete = async () => {
    setLoading(true);
    try {
      
      const userId = user?.user_id || user?.id || user?.uid;
      if (userId) {
        await setDoc(doc(db, "brand_profiles", userId), {
          user_id: userId,
          company_name: formData.companyName,
          logo_url: formData.logoUrl,
          industry: formData.industry,
          description: formData.description,
          gender_focus: formData.genderFocus,
          website_url: formData.websiteUrl,
          social_handle: formData.socialHandle,
          team_size: formData.teamSize,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pinCode,
          campaign_types: formData.campaignTypes,
          budget_range: formData.budgetRange,
          creator_size: formData.creatorSize,
          preferred_niches: formData.niches,
          onboarded_at: new Date().toISOString(),
          onboarding_completed: true
        }, { merge: true });
        
        await setDoc(doc(db, "users", userId), { onboarded: true, onboarding_completed: true }, { merge: true });
      }

      
      if (onComplete) onComplete();
    } catch (e) {
       console.error("BRAND ONBOARD ERROR", e);
       toast.error("Failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignType = (type) => {
    setFormData(prev => ({
      ...prev,
      campaignTypes: prev.campaignTypes.includes(type) 
        ? prev.campaignTypes.filter(t => t !== type)
        : [...prev.campaignTypes, type]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative w-full">
      {/* Left panel */}
      <section className="hidden lg:flex lg:col-span-7 bg-gradient-to-b lg:bg-gradient-to-r from-card via-background to-background relative overflow-hidden flex-col items-center justify-center p-10 pt-24 min-h-screen border-r border-foreground/5">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
         <div className="absolute bottom-1/4 -left-10 w-[450px] h-[450px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="z-10 w-full flex justify-center mt-[-5rem]">
           <BrandLivePreview formData={formData} currentStep={step} user={user} />
         </div>
      </section>

      {/* Right panel */}
      <section className="w-full lg:col-span-5 flex flex-col justify-center pt-24 pb-12 px-6 sm:p-12 md:p-16 relative bg-[var(--bg-base)] min-h-screen">
        <div className="w-full max-w-sm sm:max-w-md mx-auto relative mb-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="bs1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Tell us about your brand</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Your logo and category will appear on your brand profile visible to creators.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Brand Logo (Highly Recommended)</label>
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden">
                       {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-contain" /> : <Building2 className="text-[var(--text-secondary)]" />}
                     </div>
                     <label className="text-sm bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 px-4 py-2 rounded-xl border border-[#3B82F6]/30 transition font-bold cursor-pointer">
                       Upload Logo
                       <input 
                         type="file" 
                         className="hidden" 
                         accept="image/*"
                         onChange={e => {
                           if (e.target.files?.[0]) {
                             setFormData({...formData, logoUrl: URL.createObjectURL(e.target.files[0])});
                           }
                         }}
                       />
                     </label>
                   </div>
                   <p className="text-xs text-[var(--text-tertiary)] mt-2">ⓘ Brands with logos get 3x more creator applications.</p>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Brand / Company Name *</label>
                   <input 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                     placeholder="e.g. Nova Brand Co"
                     value={formData.companyName}
                     onChange={e => setFormData({...formData, companyName: e.target.value})}
                   />
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Industry / Category *</label>
                   <div className="relative">
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                       placeholder="e.g. Fashion"
                       value={nicheSearch}
                       onChange={e => {
                         setNicheSearch(e.target.value);
                         setShowNicheDropdown(true);
                       }}
                       onFocus={() => setShowNicheDropdown(true)}
                     />
                     {showNicheDropdown && nicheSearch && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[#3B82F6]/30 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl">
                         {filteredNiches.length > 0 ? filteredNiches.map(n => (
                           <button 
                             key={n} 
                             className="w-full text-left px-4 py-3 text-[var(--text-primary)] hover:bg-[#3B82F6]/20 flex justify-between group"
                             onClick={() => {
                               setFormData({...formData, industry: n});
                               setNicheSearch(n);
                               setShowNicheDropdown(false);
                             }}
                           >
                             {n} <span className="text-[#3B82F6] opacity-0 group-hover:opacity-100 uppercase text-[10px] font-bold">Select ↓</span>
                           </button>
                         )) : <div className="p-4 text-[var(--text-secondary)] text-sm">No matching category found</div>}
                       </div>
                     )}
                   </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Brand Description</label>
                   <textarea 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none min-h-[100px]"
                     placeholder="Tell creators what your brand is about..."
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                   <div className="text-[10px] text-right text-[var(--text-secondary)] mt-1">Max 200 characters</div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Gender Focus (Your Target Audience)</label>
                   <div className="flex flex-wrap gap-2">
                     {["Primarily Female", "Primarily Male", "Mixed", "All"].map(focus => (
                       <button
                         key={focus}
                         onClick={() => setFormData({...formData, genderFocus: focus})}
                         className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.genderFocus === focus ? 'bg-[#3B82F6] border-[#3B82F6] text-[var(--text-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {focus}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <button onClick={() => setStep(2)} className="bg-[#3B82F6] text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5">
                     Continue <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="bs2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">Your Business Presence</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">Help creators understand your scale and legitimacy.</p>

              <div className="space-y-6">
                 <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Website URL</label>
                   <div className="relative">
                     <input 
                       className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                       placeholder="https://"
                       value={formData.websiteUrl}
                       onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Primary Social Handle</label>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] font-bold">@</span>
                     <input 
                       className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 pl-8 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                       placeholder="brand_handle"
                       value={formData.socialHandle}
                       onChange={e => setFormData({...formData, socialHandle: e.target.value.replace('@', '')})}
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Team Size</label>
                   <div className="flex flex-wrap gap-2">
                     {["Solo", "2-10", "11-50", "51-200", "200+"].map(size => (
                       <button
                         key={size}
                         onClick={() => setFormData({...formData, teamSize: size})}
                         className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.teamSize === size ? 'bg-[#3B82F6] border-[#3B82F6] text-[var(--text-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {size}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="flex-1 relative">
                     <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">City *</label>
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                       placeholder="e.g. Mumbai"
                       value={citySearch}
                       onChange={e => {
                         setCitySearch(e.target.value);
                         setShowCityDropdown(true);
                       }}
                       onFocus={() => setShowCityDropdown(true)}
                     />
                     {showCityDropdown && citySearch && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[#3B82F6]/30 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl">
                         {filteredCities.map(c => (
                           <button 
                             key={c} 
                             className="w-full text-left px-4 py-3 text-[var(--text-primary)] hover:bg-[#3B82F6]/20"
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
                     <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">State *</label>
                     <input 
                       className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                       readOnly
                       value={formData.state}
                       placeholder="e.g. Maharashtra"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Pin Code</label>
                   <input 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none border-dashed"
                     placeholder="e.g. 400001"
                     value={formData.pinCode}
                     onChange={e => handlePincodeChange(e.target.value)}
                     maxLength={6}
                   />
                </div>

                <div className="pt-4 flex justify-between">
                   <button onClick={() => setStep(1)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                     <ArrowLeft size={18} /> Back
                   </button>
                   <button onClick={() => setStep(3)} className="bg-[#3B82F6] text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5">
                     Continue <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="bs3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">What campaigns will you run?</h2>
              <p className="text-[var(--text-tertiary)] mt-2 mb-8">This helps creators understand if they're a match for you.</p>

              <div className="space-y-6">
                
                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Campaign Types (Select all that apply)</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       { id: "paid", icon: "💰", label: "Paid Collaborations" },
                       { id: "barter", icon: "🎁", label: "Barter / Product Send" },
                       { id: "ambassador", icon: "🤝", label: "Long-term Ambassador" },
                       { id: "onetime", icon: "🎬", label: "One-time Content" }
                     ].map(type => (
                       <button
                         key={type.id}
                         onClick={() => toggleCampaignType(type.id)}
                         className={`p-3 rounded-xl text-sm font-bold border transition-all text-left flex items-center gap-2 ${formData.campaignTypes.includes(type.id) ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[var(--text-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         <span className="text-xl">{type.icon}</span> {type.label}
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Typical Budget Per Campaign</label>
                   <div className="flex flex-wrap gap-2">
                     {["Under ₹10,000", "₹10K–₹50K", "₹50K–₹2L", "₹2L+"].map(budget => (
                       <button
                         key={budget}
                         onClick={() => setFormData({...formData, budgetRange: budget})}
                         className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.budgetRange === budget ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {budget}
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Preferred Creator Size</label>
                   <div className="flex flex-wrap gap-2">
                     {["Nano 1K–10K", "Micro 10K–100K", "Macro 100K–1M", "Mega 1M+"].map(size => (
                       <button
                         key={size}
                         onClick={() => setFormData({...formData, creatorSize: size})}
                         className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.creatorSize === size ? 'bg-[#3B82F6] border-[#3B82F6] text-[var(--text-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-white/30'}`}
                       >
                         {size}
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 uppercase tracking-widest">Preferred Niches (Optional)</label>
                   <input 
                     className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 text-[var(--text-primary)] focus:border-[#3B82F6]/50 focus:outline-none"
                     placeholder="e.g. Fashion & Apparel"
                     value={formData.niches}
                     onChange={e => setFormData({...formData, niches: e.target.value})}
                   />
                </div>

                <div className="bg-[var(--bg-card)] border border-[#10B981]/20 p-4 rounded-xl flex items-start gap-4 text-xs text-[var(--text-tertiary)] leading-relaxed max-w-lg mt-8">
                   <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                     <Shield className="text-[#10B981]" size={18} />
                   </div>
                   <div>
                     <p className="text-[#10B981] font-bold uppercase tracking-wider mb-1">⊙ SSL Escrow Protected Settlements</p>
                     All payments made on Ybex platform are secured in neutral escrow accounts prior to contract completion.
                   </div>
                </div>

                <div className="pt-4 flex justify-between">
                   <button onClick={() => setStep(2)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                     <ArrowLeft size={18} /> Back
                   </button>
                   <button onClick={handleSaveAndComplete} disabled={loading} className="bg-gradient-to-r from-[#D9F111] to-[#cbe010] text-[#12121A] px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:opacity-90 transition shadow-[0_0_20px_rgba(217,241,17,0.3)] disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5">
                     {loading ? <Loader2 className="animate-spin" size={18}/> : "Publish Brand Profile ✓"}
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
