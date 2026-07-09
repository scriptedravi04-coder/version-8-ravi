import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, IndianRupee, Megaphone, ArrowRight, Search, MapPin, DollarSign, Clock, Briefcase, Plus, CheckCircle, Package, Monitor, X, PlayCircle, Instagram, Twitter, Youtube, Linkedin, Star, AlignLeft, SlidersHorizontal, ChevronDown, Check, Sparkles, Facebook, Zap, Video } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const PlatformIcon = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram size={16} className="text-pink-500" />;
    case 'youtube': return <Youtube size={16} className="text-red-500" />;
    case 'tiktok': return <PlayCircle size={16} className="text-[var(--text-primary)]" />;
    case 'twitter': return <Twitter size={16} className="text-blue-400" />;
    case 'facebook': return <Facebook size={16} className="text-blue-500" />;
    case 'linkedin': return <Linkedin size={16} className="text-blue-600" />;
    case 'snapchat': return <Star size={16} className="text-yellow-400" />;
    default: return <Monitor size={16} className="text-[var(--text-tertiary)]" />;
  }
};

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("Live Campaigns");

  const [showPaidFilter, setShowPaidFilter] = useState(false);
  const [isPaidOnly, setIsPaidOnly] = useState(false);
  
  const [showLocFilter, setShowLocFilter] = useState(false);
  const [showLangFilter, setShowLangFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  
  const [showActivity, setShowActivity] = useState(false);

  const [selectedBrief, setSelectedBrief] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [locFilter, setLocFilter] = useState("All");
  const [platFilter, setPlatFilter] = useState([]);
  const [budgetRange, setBudgetRange] = useState(100000); 
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const [campsRes, ugcRes] = await Promise.all([
          api.get("/campaigns").catch(() => ({ data: [] })),
          api.get("/ugc/briefs/available").catch(() => ({ data: [] }))
        ]);

        const campsList = Array.isArray(campsRes.data) ? campsRes.data : [];
        const ugcList = Array.isArray(ugcRes.data) ? ugcRes.data : [];

        const mappedCamps = campsList.filter(c => c.status === "live" || c.stage === "Live" || c.stage === "Under Review").map(c => {
          let days = 0;
          if (c.deadline) {
            const diff = new Date(c.deadline).getTime() - Date.now();
            days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
          }
          return {
            id: c.campaign_id || c.id,
            brand_name: c.brand_name || "Brand Name",
            brand_logo: c.brand_logo || "https://ui-avatars.com/api/?name=B&background=7C3AED&color=fff",
            title: c.title,
            categories: c.categories || (c.category ? [c.category] : ["General"]),
            platforms: c.platforms || [],
            location: c.location_type || c.city || "Pan India",
            budget_min: c.budget_min || 0,
            budget_max: c.budget_max || 0,
            deliverables: c.deliverables || [],
            expiry_days: days,
            description: c.description || "",
            status: c.status,
            brand_type: c.brand_type || "Various",
            follower_min: c.follower_min,
            follower_max: c.follower_max,
            views: Math.floor(Math.random() * 500) + 50,
            applied: Math.floor(Math.random() * 50) + 5,
            creator_name: c.creator_name || "Marketing Manager",
            time_ago: "1d ago",
            isUgc: false
          };
        });

        const mappedUgc = ugcList.map(b => {
          return {
            id: b.id,
            brand_name: b.brand_name || b.company || "Brand Partner",
            brand_logo: b.brand_logo || "https://ui-avatars.com/api/?name=UGC&background=047857&color=fff",
            title: b.title || `Review of ${b.product_name || 'Product'}`,
            categories: ["UGC", b.product_name || "Product Video"].filter(Boolean),
            platforms: [b.deliverable_type || "ugc_video"],
            location: "Remote / WFH",
            budget_min: b.budget || 0,
            budget_max: b.budget || 0,
            deliverables: [b.deliverable_type ? `1x ${b.deliverable_type.replace(/_/g, ' ')}` : "1x UGC Video"],
            expiry_days: 1,
            description: b.product_description || b.detailed_requirements || "Produce high-quality UGC video content for this brand.",
            status: "live",
            brand_type: "UGC Campaign",
            follower_min: 0,
            follower_max: 10000000,
            views: Math.floor(Math.random() * 300) + 10,
            applied: b.claimed_count || 0,
            creator_name: "UGC Operations Manager",
            time_ago: "Just now",
            isUgc: true,
            rawUgcBrief: b
          };
        });

        setData([...mappedCamps, ...mappedUgc]);
      } catch (e) {
        console.error(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const togglePlatform = (p) => {
    setPlatFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleClaim = async () => {
    if(!selectedBrief) return;
    toast.loading("Claiming brief...", { id: 'claim' });
    try {
      const { data } = await api.post("/ugc/orders/claim", { brief_id: selectedBrief.id });
      toast.success("Brief claimed successfully!", { id: 'claim' });
      if (data.thread_id) {
        navigate(`/chat/${data.thread_id}`);
      } else {
        navigate("/creator/ugc/orders");
      }
    } catch(e) {
      toast.error(e.response?.data?.error || "Failed to claim", { id: 'claim' });
    }
  };

  const getPayout = (budget) => {
    const feePercent = budget <= 20000 ? 5 : 2;
    return budget - (budget * feePercent / 100);
  };

  const filtered = useMemo(() => {
    return data.filter(c => {
      if (activeTab === "Live Campaigns" && (c.isUgc || c.status !== "live")) return false;
      if (activeTab === "Closed Campaigns" && (c.isUgc || c.status !== "closed")) return false;
      if (activeTab === "UGC Campaigns" && !c.isUgc) return false;
      
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brand_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "All" && !c.categories.includes(catFilter)) return false;
      if (locFilter !== "All" && c.location !== locFilter) return false;
      if (platFilter.length > 0 && !c.platforms.some(p => platFilter.includes(p))) return false;
      if (c.budget_min > budgetRange) return false;
      if (isPaidOnly && c.budget_min === 0 && !c.price_range) return false;
      return true;
    });
  }, [data, search, catFilter, locFilter, platFilter, budgetRange, activeTab]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12" data-testid="campaigns-page"> 
 
      {/* Activity Modal */}
      <AnimatePresence>
        {showActivity && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2"><Clock size={20} className="text-[var(--violet)]"/> My Activity</h3>
                <button onClick={() => setShowActivity(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><X size={20}/></button>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                <div className="p-4 border-b border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-colors flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle size={18} className="text-emerald-500"/>
                   </div>
                   <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">Application Accepted</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Nike Summer Fit Campaign approved your application.</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-2 font-mono">2 hours ago</p>
                   </div>
                </div>
                <div className="p-4 border-b border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-colors flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-blue-500"/>
                   </div>
                   <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">Draft Submitted</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">UrbanOutfitters Reel Draft uploaded for review.</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-2 font-mono">1 day ago</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Campaigns</h1>
          <p className="text-[var(--text-secondary)] font-medium">No fee. Zero commissions.</p>
        </div>
        <button onClick={() => setShowActivity(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl font-bold text-sm text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors relative z-10">
          <Clock size={16} /> My Activity
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">1</span>
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 gap-3 custom-scrollbar hide-scrollbar-arrows">
        {["Live Campaigns", "Closed Campaigns", "UGC Campaigns"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${activeTab === tab ? 'bg-[var(--violet)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Search & Filter Bar */}
        
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full relative z-20">
          <div onClick={() => { setIsPaidOnly(!isPaidOnly); }} className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold cursor-pointer transition-colors ${isPaidOnly ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[var(--bg-elevated)] border-[var(--border-default)]'}`}>
             <span className={`w-2 h-2 rounded-full ${isPaidOnly ? 'bg-red-500' : 'bg-[var(--text-tertiary)]'}`}></span> Paid
          </div>
          
          <div className="relative">
            <div onClick={() => {setShowLocFilter(!showLocFilter); setShowLangFilter(false); setShowTypeFilter(false);}} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer hover:bg-[var(--border-default)]">
               Location {locFilter !== 'All' && <span className="text-[var(--violet)]">({locFilter})</span>} <ChevronDown size={14}/>
            </div>
            {showLocFilter && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg p-2 flex flex-col gap-1 z-30">
                {['All', 'Mumbai, India', 'Delhi, India', 'Bangalore, India'].map(l => (
                  <button key={l} onClick={() => {setLocFilter(l); setShowLocFilter(false);}} className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${locFilter === l ? 'bg-[var(--violet)]/10 text-[var(--violet)] font-bold' : 'hover:bg-[var(--bg-elevated)]'}`}>{l}</button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <div onClick={() => {setShowLangFilter(!showLangFilter); setShowLocFilter(false); setShowTypeFilter(false);}} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer hover:bg-[var(--border-default)]">
               Language <ChevronDown size={14}/>
            </div>
            {showLangFilter && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg p-2 flex flex-col gap-1 z-30">
                {['English', 'Hindi', 'Marathi', 'Tamil'].map(l => (
                  <button key={l} onClick={() => setShowLangFilter(false)} className="text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-elevated)] transition-colors">{l}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div onClick={() => {setShowTypeFilter(!showTypeFilter); setShowLocFilter(false); setShowLangFilter(false);}} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer hover:bg-[var(--border-default)]">
               Campaign Type <ChevronDown size={14}/>
            </div>
            {showTypeFilter && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg p-2 flex flex-col gap-1 z-30">
                {['UGC', 'Barter', 'Paid Integration', 'Affiliate'].map(l => (
                  <button key={l} onClick={() => setShowTypeFilter(false)} className="text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-elevated)] transition-colors">{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--violet)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((c, index) => {
              const endsSoon = c.expiry_days > 0 && c.expiry_days <= 3;
              return (
              <div key={c.id + "-" + index} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-xl hover:border-[var(--violet)]/30 transition-all cursor-pointer group flex flex-col" onClick={() => {
                if (c.isUgc) {
                  setSelectedBrief(c.rawUgcBrief);
                } else {
                  navigate(`/campaigns/${c.id}`);
                }
              }}>
                 {/* Header */}
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 items-center">
                       <img src={c.brand_logo} alt="brand" className="w-14 h-14 rounded-full object-cover border border-[var(--border-default)]" />
                       <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-1.5">
                             {c.brand_name} <CheckCircle size={14} className="text-emerald-500" />
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                             <Briefcase size={12} /> {c.creator_name} @ {c.brand_name}
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{c.time_ago}</p>
                       </div>
                    </div>
                    {c.isUgc ? (
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border text-yellow-400 bg-yellow-500/10 border-yellow-500/20 flex items-center gap-1">
                        <Zap size={10} className="fill-yellow-400" /> 24h Express
                      </div>
                    ) : (
                      c.expiry_days > 0 && (
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${endsSoon ? 'animate-pulse text-red-500 bg-red-500/10 border-red-500/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>
                          Ends in {c.expiry_days}d
                        </div>
                      )
                    )}
                 </div>

                 {c.isUgc ? (
                   <div className="flex items-center gap-1.5 text-sm font-bold text-yellow-400 mb-4">
                      <Zap size={16} /> Open for instant claim
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500 mb-4">
                      <CheckCircle size={16} /> Actively reviewing
                   </div>
                 )}

                 <div className="mb-6 flex-1">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Looking for</p>
                    <div className="text-[var(--text-primary)] font-semibold text-lg line-clamp-2 leading-snug">
                       {c.categories.join(", ")}
                    </div>
                 </div>

                 {/* Grid details */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-8 h-8 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><IndianRupee size={16}/></div>
                       <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">{c.isUgc ? "Creator Payout" : "Per Influencer"}</p>
                          <p className="font-bold text-[var(--text-primary)] text-xs">
                            {c.isUgc ? `₹${getPayout(c.budget_min).toLocaleString()}` : (c.budget_min === 0 ? "Barter" : `₹${c.budget_min.toLocaleString()} ${c.budget_max ? `- ₹${c.budget_max.toLocaleString()}` : '+'}`)}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-8 h-8 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><Megaphone size={16}/></div>
                       <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">{c.isUgc ? "Format" : "Brand Type"}</p>
                          <p className="font-bold text-[var(--text-primary)] text-xs truncate">{c.isUgc ? c.platforms[0]?.replace(/_/g, ' ') : c.brand_type}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-8 h-8 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><MapPin size={16}/></div>
                       <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">Location</p>
                          <p className="font-bold text-[var(--text-primary)] text-xs">{c.location}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-8 h-8 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><Package size={16}/></div>
                       <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-0.5">{c.isUgc ? "Claim Progress" : "Deliverables"}</p>
                          <p className="font-bold text-[var(--text-primary)] text-xs line-clamp-2">
                             {c.isUgc ? (
                               <span>{c.rawUgcBrief.claimed_count || 0} / {c.rawUgcBrief.max_creators || 1} Claimed</span>
                             ) : (
                               c.deliverables.map((d, i) => (
                                 <span key={i} className="block">{d}</span>
                               ))
                             )}
                             {!c.isUgc && c.deliverables.length === 0 && "1x Instagram Reel"}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Description Body */}
                 <div className="text-sm text-[var(--text-primary)] leading-relaxed mb-6 space-y-2 flex-1">
                    <p>✨ <strong>Creators, it's a match!</strong></p>
                    <p className="line-clamp-2 text-[var(--text-secondary)]">{c.description || "We are collaborating with an amazing brand and looking for creators who can turn heads and spark conversations."}</p>
                 </div>

                 {/* Footer Stats */}
                 <div className="border-t border-[var(--border-default)] pt-4 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mt-auto">
                    <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1.5"><Eye size={14}/> {c.views} Views</span>
                       <span className="flex items-center gap-1.5 text-[var(--violet)]">
                          <div className="flex -space-x-2">
                             <img src="https://ui-avatars.com/api/?name=A&background=random" className="w-5 h-5 rounded-full border border-[var(--bg-card)]"/>
                             <img src="https://ui-avatars.com/api/?name=B&background=random" className="w-5 h-5 rounded-full border border-[var(--bg-card)]"/>
                          </div>
                          {c.isUgc ? (
                            <span>{c.applied} of {c.rawUgcBrief.max_creators || 1} claimed</span>
                          ) : (
                            <span>{c.applied}+ creators applied</span>
                          )}
                       </span>
                    </div>
                 </div>

              </div>
            )})}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-3xl">
             <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] mb-4">
               <Search size={24} />
             </div>
             <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">No campaigns found</h3>
             <p className="text-[var(--text-secondary)] text-sm max-w-sm">We couldn't find any campaigns matching your current filters. Try adjusting them to see more results.</p>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedBrief && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={()=>setSelectedBrief(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y: 20}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.95, opacity:0, y: 20}} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-2xl">
               <div className="inline-flex items-center gap-1.5 bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#facc15]/20 mb-4">
                 <Zap size={10} /> 22-Hour Delivery Promise
               </div>
               <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{selectedBrief.title}</h3>
               <p className="text-[var(--text-tertiary)] text-sm mb-6 pb-6 border-b border-[var(--border-default)]">{selectedBrief.product_description}</p>

               <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto pr-2">
                 {selectedBrief.detailed_requirements && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Detailed Requirements</h4>
                     <p className="text-sm text-[var(--text-tertiary)] leading-relaxed bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">{selectedBrief.detailed_requirements}</p>
                   </div>
                 )}
                 {selectedBrief.sample_content_url && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Sample Reference</h4>
                     <a href={selectedBrief.sample_content_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--violet)] hover:underline underline-offset-4 flex items-center gap-1">
                       View Sample Content
                     </a>
                   </div>
                 )}
                 <div>
                   <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Do</h4>
                   <ul className="text-sm text-emerald-400 space-y-1">
                     {selectedBrief.dos?.[0] ? selectedBrief.dos.map((d, i) => <li key={i}>✅ {d}</li>) : <li>No specific requirements</li>}
                   </ul>
                 </div>
                 {selectedBrief.donts?.[0] && (
                   <div>
                     <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Not Do</h4>
                     <ul className="text-sm text-[#ef4444] space-y-1">
                       {selectedBrief.donts.map((d, i) => <li key={i}>❌ {d}</li>)}
                     </ul>
                   </div>
                 )}
               </div>

               <div className="bg-[var(--bg-elevated)] border border-[#7c3aed]/30 rounded-xl p-4 mb-6">
                 <p className="text-sm font-medium text-purple-300">By claiming this brief, you commit to delivering the video within exactly 22 hours. Missing the deadline will cancel the order.</p>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#7c3aed]/20">
                   <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold">Your Payout</span>
                   <span className="text-emerald-400 font-black text-xl font-mono">₹{getPayout(selectedBrief.budget).toLocaleString()}</span>
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setSelectedBrief(null)} className="w-1/3 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl border border-[var(--border-default)] active:scale-95 transition-transform text-sm">Cancel</button>
                 <button onClick={handleClaim} className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg text-sm flex items-center justify-center gap-2">
                   <Zap size={16} /> I Commit — Claim Now
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
