import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Camera, Edit2, ShieldAlert, AlertTriangle, Eye, Briefcase, Star, 
  TrendingUp, Instagram, Clock, Link as LinkIcon, CheckCircle, X, ChevronRight, Check
} from "lucide-react";
import { LocationAutocomplete } from "../components/ui/autocomplete";
import ImageUpload from "../components/ImageUpload";

// Mock Instagram API Hook
const useInstagramData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Required APIs: 
    // 1. Facebook Login for Business (OAuth)
    // 2. Instagram Graph API (/me/accounts, /ig_user/insights, /ig_user/media)
    const fetchAPI = async () => {
      // Mocking the real API response
      setTimeout(() => {
        setData({
          health_score: 92,
          growth_rate: "+12.4%",
          followers: 84500,
          following: 420,
          posts_count: 342,
          last_posted_days_ago: 8,
          recent_posts: [
            { id: 1, type: "REEL", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", likes: 4500 },
            { id: 2, type: "IMAGE", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400", likes: 2100 },
            { id: 3, type: "CAROUSEL", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", likes: 3200 }
          ]
        });
        setLoading(false);
      }, 1000);
    };
    fetchAPI();
  }, []);

  return { data, loading };
};

export default function MyProfile() {
  const { user } = useAuth();
  const igData = useInstagramData();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "Creator",
    profession: "Content Creator",
    profileType: "Individual creator",
    gender: "",
    language: "English",
    city: "Mumbai, India",
    socials: [{ platform: "Instagram", url: "https://instagram.com/myhandle" }],
    avatar: user?.avatar || "https://ui-avatars.com/api/?name=C&background=7C3AED&color=fff",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
  });

  const [stats, setStats] = useState({
    creator_score: 85,
    active_deals: 3,
    brand_interests: 12,
    profile_views: 1420
  });

  const [alerts, setAlerts] = useState({
    kyc_missing: true,
    portfolio_missing: true,
    charges_missing: true,
    bank_missing: true
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const location = useLocation();

  const handleEditOpen = () => {
    setFormData({ ...profileData });
    setEditModalOpen(true);
  };

  useEffect(() => {
    if (location.search.includes("edit=true")) {
      handleEditOpen();
    }
  }, [location.search]);

  useEffect(() => {
    // In reality, fetch from Supabase:
    // const { data } = await supabase.from('creator_profiles').select('*').eq('user_id', user.id).single();
    // Verify all tables are present in Supabase -> creator_profiles, brand_profiles, verifications, campaigns, etc.
  }, [user]);

  const handleSave = async () => {
    try {
      // await supabase.from('creator_profiles').update(formData).eq('user_id', user.id);
      setProfileData({ ...formData });
      toast.success("Profile updated in real-time!");
      setEditModalOpen(false);
    } catch (e) {
      toast.error("Failed to update.");
    }
  };

  const PROFILE_TYPES = [
    "Couple page", "Meme page", "Community page", "Fan page", 
    "Publisher", "Media house", "Group of friends", "Individual creator"
  ];
  
  const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Tamil", "Telugu", "Marathi", "Bengali"];
  const [langSearch, setLangSearch] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* HEADER SECTION */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-xl mb-8 relative group">
        <div className="relative w-full h-48 md:h-64 bg-slate-900">
          <img src={profileData.coverImage} className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Cover" />
          <button onClick={handleEditOpen} className="absolute top-4 right-4 bg-black/40 hover:bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2">
            <Camera size={16} /> Update Cover
          </button>
        </div>

        <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start gap-6 w-full">
            <div className="relative -mt-20 md:-mt-24 shrink-0 z-20 group/avatar cursor-pointer" onClick={handleEditOpen}>
               <img src={profileData.avatar} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--bg-card)] object-cover bg-[var(--bg-card)] shadow-lg" alt="Avatar"/>
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                 <Camera size={24} className="text-white" />
               </div>
            </div>
            <div className="mt-2 flex-1">
              <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">{profileData.name}</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium flex items-center gap-2">
                {profileData.profession} • {profileData.city}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="px-3 py-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 rounded-lg text-xs font-bold">
                  {profileData.profileType}
                </span>
                <button onClick={handleEditOpen} className="px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] border border-[var(--border-default)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors flex items-center gap-2">
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MISSING INFO ALERTS */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.kyc_missing && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3">
             <ShieldAlert size={18} className="text-rose-500 shrink-0" />
             <div>
               <h4 className="text-xs font-bold text-rose-500">KYC Not Finalized</h4>
               <p className="text-[10px] text-[var(--text-secondary)] mt-1">Complete identity verification to receive payments.</p>
               <button className="mt-2 text-[10px] font-bold text-rose-500 hover:underline">Update KYC</button>
             </div>
          </div>
        )}
        {alerts.portfolio_missing && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
             <Briefcase size={18} className="text-amber-500 shrink-0" />
             <div>
               <h4 className="text-xs font-bold text-amber-500">Portfolio Empty</h4>
               <p className="text-[10px] text-[var(--text-secondary)] mt-1">Add past work to increase brand trust.</p>
               <button className="mt-2 text-[10px] font-bold text-amber-500 hover:underline">Upload Portfolio</button>
             </div>
          </div>
        )}
        {alerts.charges_missing && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
             <AlertTriangle size={18} className="text-blue-500 shrink-0" />
             <div>
               <h4 className="text-xs font-bold text-blue-500">Charges Not Added</h4>
               <p className="text-[10px] text-[var(--text-secondary)] mt-1">Set your rate card so brands can invite you.</p>
               <button className="mt-2 text-[10px] font-bold text-blue-500 hover:underline">Add Rates</button>
             </div>
          </div>
        )}
        {alerts.bank_missing && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3">
             <CheckCircle size={18} className="text-emerald-500 shrink-0" />
             <div>
               <h4 className="text-xs font-bold text-emerald-500">Bank Details Missing</h4>
               <p className="text-[10px] text-[var(--text-secondary)] mt-1">Add bank info to ensure smooth payouts.</p>
               <button className="mt-2 text-[10px] font-bold text-emerald-500 hover:underline">Add Bank Info</button>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: METRICS */}
        <div className="space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-6 uppercase tracking-widest">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--violet)]/10 text-[var(--violet)] flex items-center justify-center"><Star size={18}/></div>
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Creator Score</span>
                </div>
                <span className="text-xl font-black text-[var(--text-primary)]">{stats.creator_score}/100</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Briefcase size={18}/></div>
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Active Deals</span>
                </div>
                <span className="text-xl font-black text-[var(--text-primary)]">{stats.active_deals}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D9F111]/10 text-[#D9F111] flex items-center justify-center"><TrendingUp size={18}/></div>
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Brand Interest</span>
                </div>
                <span className="text-xl font-black text-[var(--text-primary)]">{stats.brand_interests}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Eye size={18}/></div>
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Profile Views</span>
                </div>
                <span className="text-xl font-black text-[var(--text-primary)]">{stats.profile_views}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] border border-[var(--border-default)] rounded-xl text-xs font-bold transition-colors">
              Complete Your Profile
            </button>
          </div>
        </div>

        {/* RIGHT COL: INSTAGRAM DATA */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[80px]" />
             
             <div className="flex items-center justify-between mb-6 relative">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                  <Instagram size={18} className="text-pink-500" /> Instagram Overview
                </h3>
                <span className="text-[10px] font-bold bg-[var(--bg-elevated)] px-3 py-1 rounded-full border border-[var(--border-default)]">Live API Sync</span>
             </div>

             {igData.loading ? (
               <div className="py-12 text-center text-[var(--text-secondary)] animate-pulse text-sm">
                 Connecting to Instagram Graph API...
               </div>
             ) : (
               <>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-default)] text-center">
                     <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mb-1">Health Score</div>
                     <div className="text-2xl font-black text-emerald-400">{igData.data.health_score}</div>
                   </div>
                   <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-default)] text-center">
                     <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mb-1">Growth</div>
                     <div className="text-2xl font-black text-[#D9F111]">{igData.data.growth_rate}</div>
                   </div>
                   <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-default)] text-center">
                     <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mb-1">Followers</div>
                     <div className="text-2xl font-black text-[var(--text-primary)]">{(igData.data.followers / 1000).toFixed(1)}k</div>
                   </div>
                   <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-default)] text-center">
                     <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] mb-1">Posts</div>
                     <div className="text-2xl font-black text-[var(--text-primary)]">{igData.data.posts_count}</div>
                   </div>
                 </div>

                 {igData.data.last_posted_days_ago > 3 && (
                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 mb-8 items-center">
                     <Clock size={20} className="text-amber-500 shrink-0" />
                     <div className="flex-1">
                       <h4 className="text-sm font-bold text-amber-500">Time to post!</h4>
                       <p className="text-xs text-[var(--text-secondary)]">It's been {igData.data.last_posted_days_ago} days since your last post. Keep your audience engaged to maintain your health score.</p>
                     </div>
                     <a href="https://instagram.com" target="_blank" rel="noreferrer" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors">
                       Open Instagram
                     </a>
                   </div>
                 )}

                 <div>
                   <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Recent Posts</h4>
                   <div className="grid grid-cols-3 gap-4">
                     {igData.data.recent_posts.map(p => (
                       <div key={p.id} className="aspect-[4/5] rounded-xl overflow-hidden relative group">
                         <img src={p.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="IG Post" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="text-white text-xs font-bold flex items-center gap-1.5"><HeartIcon /> {p.likes}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="text-[10px] text-[var(--text-tertiary)] mt-6 bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">
                   <strong className="text-[var(--text-primary)]">Required APIs for Production:</strong> Facebook Login for Business (OAuth), Instagram Graph API (endpoints: <code className="text-[#D9F111]">/me/accounts</code>, <code className="text-[#D9F111]">/ig_user/insights</code>, <code className="text-[#D9F111]">/ig_user/media</code>).
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setEditModalOpen(false)} className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><X size={20}/></button>
              
              <h2 className="font-display font-black text-2xl text-[var(--text-primary)] mb-6">Edit Profile</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Profile Avatar</label>
                    <ImageUpload 
                      value={formData.avatar} 
                      onChange={(url) => setFormData({ ...formData, avatar: url })} 
                      label="Upload Avatar" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Cover Image</label>
                    <ImageUpload 
                      value={formData.coverImage} 
                      onChange={(url) => setFormData({ ...formData, coverImage: url })} 
                      label="Upload Cover" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Display Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)]" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Full-time Profession</label>
                  <input type="text" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)]" placeholder="e.g. Actor, Model, Tech Reviewer" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Profile Type</label>
                  <select value={formData.profileType} onChange={e => setFormData({...formData, profileType: e.target.value})} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)] appearance-none">
                    {PROFILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {formData.profileType === "Individual creator" && (
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)] appearance-none">
                      <option value="" disabled>Select Gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Content Language</label>
                    <div className="relative">
                      <input type="text" placeholder="Search language..." value={langSearch} onChange={e => setLangSearch(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)] mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).slice(0, 5).map(l => (
                          <button key={l} onClick={() => {setFormData({...formData, language: l}); setLangSearch("");}} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${formData.language === l ? "bg-[var(--violet)] text-white border-[var(--violet)]" : "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Current City</label>
                    <LocationAutocomplete 
                      value={formData.city} 
                      onChange={(val) => setFormData({...formData, city: val})} 
                      placeholder="e.g. Jaipur"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Social Media Link</label>
                  <div className="flex gap-2">
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm flex items-center justify-center shrink-0">
                       <Instagram size={16} />
                    </div>
                    <input type="text" value={formData.socials[0]?.url} onChange={e => setFormData({...formData, socials: [{platform: 'Instagram', url: e.target.value}]})} className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--violet)] text-[var(--text-primary)]" placeholder="https://instagram.com/..." />
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-default)] flex gap-4">
                  <button onClick={() => setEditModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--border-default)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--violet)] text-white hover:bg-[#6D28D9] transition-all shadow-md">
                    Save Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);
