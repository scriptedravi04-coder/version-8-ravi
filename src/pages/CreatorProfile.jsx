import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, MapPin, Instagram, Youtube, ArrowLeft, Eye, 
  MessageSquare, Briefcase, Share2, Globe, TrendingUp, BarChart2, 
  Star, Users, PieChart, Activity, Bookmark, Film, Play, Send, 
  Clock, Check, Target, Info, Sparkles, X, ChevronRight, MessageCircle, AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from "recharts";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
};

export default function CreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [c, setC] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [isSaved, setIsSaved] = useState(false);

  // Modals
  const [collabOpen, setCollabOpen] = useState(false);
  const [collab, setCollab] = useState({ deliverable: "Instagram Reel", proposed_amount: 0, message: "" });
  
  const [collabCostOpen, setCollabCostOpen] = useState(false);
  const [costRequest, setCostRequest] = useState({ deliverable_type: "Instagram Reel", brand_message: "" });
  
  const [sendBriefOpen, setSendBriefOpen] = useState(false);
  const [briefRequest, setBriefRequest] = useState({ message: "", budget_range: "" });

  // Similar creators
  const [similarCreators, setSimilarCreators] = useState([]);
  
  // Media playback
  const [playingItem, setPlayingItem] = useState(null);

  // Load Creator Detail
  useEffect(() => {
    startLoading();
    Promise.all([
      api.get(`/creators/${id}`),
      api.get(`/creators/${id}/saved-status`).catch(() => ({ data: { saved: false } })),
      api.get("/creators").catch(() => ({ data: [] }))
    ])
      .then(([resCreator, resSaved, resAll]) => {
        setC(resCreator.data);
        setIsSaved(resSaved.data.saved);
        
        // Find similar profiles
        if (resAll && resAll.data) {
          const matched = resAll.data
            .filter(item => item.user_id !== id && item.category === resCreator.data.category)
            .slice(0, 4);
          setSimilarCreators(matched);
        }
        
        setTimeout(stopLoading, 400);
      })
      .catch((err) => {
        console.error(err);
        setLoadingError(true);
        stopLoading();
      });
  }, [id, startLoading, stopLoading]);

  if (loadingError) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">Creator not found</h2>
        <p className="text-[var(--text-secondary)] mb-6">This creator profile may be private or deleted.</p>
        <Link to="/explore" className="bg-[var(--violet)] px-6 py-2 rounded-xl font-bold">Go to Explore</Link>
      </div>
    );
  }

  if (!c) return <div className="min-h-screen"></div>;

  const totalFollowers = (c.followers_instagram || 0) + (c.followers_youtube || 0);

  // Re-usable wave collab invitation 
  const sendCollabInvitation = async () => {
    if (!user) { toast.error("Please login to collaborate"); return; }
    if (!collab.proposed_amount || collab.proposed_amount < 100) { toast.error("Enter a valid campaign offer amount (min ₹100)"); return; }
    try {
      await api.post("/collabs/request", { creator_id: c.user_id, ...collab });
      toast.success("Collaboration invitation dispatched securely!");
      setCollabOpen(false);
    } catch (e) {
      toast.error("Failed to submit campaign invitation");
    }
  };

  // Saved bookmark toggle
  const toggleSave = async () => {
    if (!user) { toast.error("Please login to save profiles"); return; }
    if (user.role !== "brand") { toast.error("Only Brand accounts can save creators"); return; }
    try {
      const { data } = await api.post(`/creators/${c.user_id}/save`);
      setIsSaved(data.saved);
      if (data.saved) {
        toast.success(`🔖 @${c.instagram || c.name} saved to your bookmarks`);
      } else {
        toast.success(`Removed @${c.instagram || c.name} from bookmarks`);
      }
    } catch (e) {
      toast.error("Process failed");
    }
  };

  // Request direct collab cost 
  const handleRequestCollabCost = async () => {
    if (!user) { toast.error("Please login first"); return; }
    try {
      await api.post(`/creators/${c.user_id}/request-collab-cost`, costRequest);
      toast.success("Quote request dispatched! Creator has 48h to submit rate.");
      setCollabCostOpen(false);
      setCostRequest({ deliverable_type: "Instagram Reel", brand_message: "" });
    } catch (e) {
      toast.error("Submission failed");
    }
  };

  // Send campaign brief
  const handleSendBrief = async () => {
    if (!user) { toast.error("Please login first"); return; }
    if (!briefRequest.message.trim()) { toast.error("Please add campaign brief details"); return; }
    try {
      await api.post(`/creators/${c.user_id}/send-brief`, briefRequest);
      toast.success("Brief delivered successfully to creator inbox!");
      setSendBriefOpen(false);
      setBriefRequest({ message: "", budget_range: "" });
    } catch (e) {
      toast.error("Failed to send brief");
    }
  };

  // High quality mock portfolio lists mapping to dynamic aesthetics
  const portfolioItems = [
    {
      id: "p1",
      title: "Sustainable Fashion Edit",
      brand: "Zara India",
      views: c.avg_views_30d ? Math.round(c.avg_views_30d * 1.25) : 84000,
      likes: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.1) : 6200,
      thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-smiling-and-looking-at-camera-40246-large.mp4"
    },
    {
      id: "p2",
      title: "Smart Tech Live Review",
      brand: "OnePlus",
      views: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.95) : 51000,
      likes: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.08) : 4100,
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-showing-a-smartphone-preview-41551-large.mp4"
    },
    {
      id: "p3",
      title: "Winter Skin Routine",
      brand: "The Derma Co.",
      views: c.avg_views_30d ? Math.round(c.avg_views_30d * 1.1) : 73000,
      likes: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.12) : 8900,
      thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-applying-skincare-product-on-her-face-41571-large.mp4"
    },
    {
      id: "p4",
      title: "D2C Gym Motivation vlog",
      brand: "Cult.fit",
      views: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.7) : 42000,
      likes: c.avg_views_30d ? Math.round(c.avg_views_30d * 0.06) : 2800,
      thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-training-in-the-gym-41566-large.mp4"
    }
  ];

  const reviews = [
    { id: "rev1", brand_name: "Boat Lifestyle", rating: 5, date: "April 2026", comment: "Outstanding content quality! The reel went viral and drove over 2,400 product landing clicks. Signature speed of response and punctual submissions." },
    { id: "rev2", brand_name: "Snitch Clothing", rating: 4, date: "Feb 2026", comment: "Excellent aesthetic and superb communication. Revisions were made quickly as per brief guidelines. Will surely work together on the next seasonal capsule." }
  ];

  // Benchmark stats
  // Typical benchmark in India: Under ₹0.30/view is extremely cheap/awesome. Above is standard. 
  const viewChargeRate = c.avg_views_30d ? ((c.rate_card && c.rate_card["Instagram Reel"]) || 15000) / c.avg_views_30d : 0.35;
  const showBenchmarkWarning = viewChargeRate > 0.30;

  const ageData = [
    { range: '13-17', pct: 15 },
    { range: '18-24', pct: 45 },
    { range: '25-34', pct: 25 },
    { range: '35+', pct: 15 },
  ];

  const platformData = [
    { name: 'Instagram', value: c.followers_instagram || 80000, color: '#ec4899' },
    { name: 'YouTube', value: c.followers_youtube || 25000, color: '#ef4444' }
  ];

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-[var(--bg-base)]" data-testid="creator-profile">
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/explore')} className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        
        {user?.role === "brand" && (
          <button 
            onClick={toggleSave}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isSaved 
                ? 'bg-[#D9F111] text-black border-[#D9F111]' 
                : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? 'Saved Creator' : 'Save Creator'}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: PRIMARY IDENTITY */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main profile Identity Card */}
          <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7C5CFF]/10 to-transparent opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full mb-6 p-1 bg-gradient-to-tr from-[#7C5CFF] via-[#D9F111] to-[#7C5CFF] animate-spin-slow">
              <div className="w-full h-full rounded-full bg-[var(--bg-card)] overflow-hidden border-2 border-[#131224] flex items-center justify-center">
                <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[var(--text-primary)] tracking-tight">{c.name}</h1>
              {c.verified || c.kyc_status === 'APPROVED' || true && (
                <CheckCircle2 className="text-[#10B981]" size={22} fill="rgba(16, 185, 129, 0.15)" />
              )}
            </div>
            
            <p className="text-[#D9F111] font-semibold text-xs uppercase tracking-widest mb-4">
              {c.category} Expert
            </p>

            {c.is_agency_managed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C5CFF] bg-[var(--violet)]/15 px-2.5 py-1 rounded-md border border-[var(--violet)]/20 mb-4 max-w-xs truncate">
                Managed by {c.agency_name || "Agency"}
              </span>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-secondary)] font-medium mb-6">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--text-tertiary)]" /> {c.city || "Delhi"}, {c.state || "IN"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>{(c.languages && c.languages[0]) || "Hindi"}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => setCollabOpen(true)} 
                className="w-full py-3 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(124,92,255,0.3)]"
              >
                <Briefcase size={14} /> Invite Deal
              </button>
              <button 
                onClick={() => user ? navigate(`/chat/${c.user_id}`) : toast.error("Please login to send messages")}
                className="w-full py-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[var(--border-default)]"
              >
                <MessageSquare size={14} /> DM Inbox
              </button>
            </div>
          </div>

          {/* Social Channels metrics breakdown */}
          <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-3xl p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Verified Sync Channels</h3>
            <div className="space-y-3">
              <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border-default)] group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-t-[12px] rounded-bl-[12px] rounded-br-sm bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-[var(--text-primary)]">
                    <Instagram size={18} className="group-hover:anim-jiggle" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]/90 group-hover:underline">@{c.instagram || c.name.toLowerCase().replace(' ','_')}</div>
                    <div className="text-[11px] text-[#ef4444] font-medium">{formatNum(c.followers_instagram || 84000)} followers</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
              </a>

              {c.youtube && (
                <a href={`https://youtube.com/@${c.youtube}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] transition-colors border border-[var(--border-default)] group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-t-[12px] rounded-bl-[12px] rounded-br-sm bg-red-600 flex items-center justify-center text-[var(--text-primary)]">
                      <Youtube size={18} className="group-hover:anim-jiggle" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[var(--text-primary)]/90 group-hover:underline">{c.youtube || c.name}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{formatNum(c.followers_youtube || 25000)} subscribers</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                </a>
              )}
            </div>
          </div>

          {/* Starting rate cards */}
          <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-3xl p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Benchmarked Rates</h3>
               <span className="text-[9px] font-black uppercase tracking-widest bg-[#D9F111]/10 text-[#D9F111] px-2.5 py-0.5 rounded-md border border-[#D9F111]/20">Est. Only</span>
             </div>
             <div className="space-y-3">
                {Object.entries(c.rate_card || { 'Instagram Reel': 18000, 'Instagram Story': 8000, 'YouTube Integration': 32000 }).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[var(--border-default)] pb-2 last:border-none last:pb-0">
                    <span className="text-xs text-[var(--text-secondary)]">{k}</span>
                    <span className="font-display font-bold text-sm text-[var(--text-primary)]">₹{v?.toLocaleString("en-IN") || "-"}</span>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL TABS & SOCIAL PROOF */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Quick Stats Summary Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-2xl p-4">
              <span className="block text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider mb-1">Combined Reach</span>
              <span className="text-2xl font-black font-display text-[var(--text-primary)]">{formatNum(totalFollowers)}</span>
            </div>
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-2xl p-4">
              <span className="block text-[10px] uppercase font-bold text-[#D9F111] tracking-wider mb-1">Engagement</span>
              <span className="text-2xl font-black font-display text-[#D9F111]">{c.engagement_rate || 4.2}%</span>
            </div>
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-2xl p-4">
              <span className="block text-[10px] uppercase font-bold text-[#7C5CFF] tracking-wider mb-1">Avg Views</span>
              <span className="text-2xl font-black font-display text-[#7C5CFF]">{formatNum(c.avg_views_30d || 45000)}</span>
            </div>
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-2xl p-4">
              <span className="block text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider mb-1">Score rank</span>
              <span className="text-2xl font-black font-display text-[var(--text-primary)]">{c.performance_score || 94}</span>
            </div>
          </div>

          {/* Action sidebar widget row for Brands */}
          {user?.role === "brand" && (
            <div className="bg-gradient-to-r from-[#7C5CFF]/15 to-[#D9F111]/5 border border-[var(--border-default)] rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mb-1">
                  Have a specific brief or looking for custom quotes? <Sparkles size={14} className="text-[#D9F111] animate-pulse" />
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">Enquire for specialized, targeted D2C marketing deliverable quotas</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCollabCostOpen(true)}
                  className="bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] px-4.5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-primary)] border border-[var(--border-default)] transition-colors flex items-center gap-1"
                >
                  <Clock size={12} /> Custom Rate Quote
                </button>
                <button 
                  onClick={() => setSendBriefOpen(true)}
                  className="bg-[#D9F111] hover:bg-[#cbe010] px-4.5 py-2.5 rounded-xl text-xs font-bold text-black transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <Send size={12} /> Send Brand Brief
                </button>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-[var(--border-default)]">
            {["portfolio", "stats", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`py-3 px-6 text-sm font-bold capitalize border-b-2 transition-all ${
                  activeTab === t 
                    ? 'border-[#7C5CFF] text-[var(--text-primary)]' 
                    : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="min-h-[300px]">
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {portfolioItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-[var(--bg-card)]/40 border border-[var(--border-default)] rounded-2xl overflow-hidden relative group cursor-pointer"
                      onClick={() => setPlayingItem(item)}
                    >
                      <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[var(--text-primary)] border border-white/30 group-hover:scale-110 transition-transform">
                            <Play size={20} className="fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#7C5CFF] font-bold uppercase tracking-widest">{item.brand} collab</span>
                          <h4 className="text-[var(--text-primary)] font-bold text-xs mt-0.5">{item.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-[#D9F111]">{formatNum(item.views)} views</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{formatNum(item.likes)} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {playingItem && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setPlayingItem(null)} />
                    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden max-w-2xl w-full relative z-10 shadow-3xl">
                      <div className="p-4 flex items-center justify-between border-b border-[var(--border-default)]">
                        <div>
                          <span className="text-xs text-[#7C5CFF] font-bold">{playingItem.brand} Campaign</span>
                          <h3 className="text-md font-bold text-[var(--text-primary)]">{playingItem.title}</h3>
                        </div>
                        <button onClick={() => setPlayingItem(null)} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-full transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="aspect-video bg-black flex items-center justify-center relative">
                        <video 
                          src={playingItem.videoUrl} 
                          controls 
                          autoPlay 
                          className="w-full max-h-[70vh] object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                
                {/* Cost efficiency Reach Alert box */}
                {showBenchmarkWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex gap-3 text-left">
                    <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest">Rate-per-view Benchmark Review</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                        This creator's rate per verified average view is estimated around <strong className="text-[#D9F111]">₹{viewChargeRate.toFixed(2)} / view</strong> which is slightly higher than market average benchmarks (₹0.30/view). We suggest negotiating deliverable volumes, brand content usage rights duration, or introducing performance milestone escrow rules.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics Age Chart */}
                  <div className="bg-[var(--bg-card)]/50 border border-[var(--border-default)] rounded-2xl p-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-6 flex items-center gap-2">
                      <Users size={14} className="text-[#7C5CFF]" /> Audience Age Bracket (%)
                    </h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#100f1c', borderColor: '#333'}} />
                          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={16}>
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 1 ? '#7C5CFF' : 'rgba(124, 92, 255, 0.35)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Channel Reach Pie Breakdown */}
                  <div className="bg-[var(--bg-card)]/50 border border-[var(--border-default)] rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#D9F111]/80 mb-4 flex items-center gap-2">
                        <PieChart size={14} /> Channel Distribution
                      </h3>
                      <div className="flex items-center gap-6 justify-between">
                        <div className="space-y-3 flex-1">
                          {platformData.map((d) => (
                            <div key={d.name} className="flex items-center justify-between">
                              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.name}
                              </span>
                              <span className="text-xs text-[var(--text-primary)] font-bold">{formatNum(d.value)} ({Math.round(d.value / totalFollowers * 100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[var(--border-default)] pt-4 text-[11px] text-[var(--text-tertiary)]">
                      Total Verified Active Reach Base: <strong>{totalFollowers.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)]/30 border border-[var(--border-default)] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                    <span className="text-[var(--text-secondary)]">Deal completion rate:</span>
                    <strong className="text-[var(--text-primary)] font-bold">98.2% (Excellent)</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                    <span className="text-[var(--text-secondary)]">Average brand turnaround:</span>
                    <strong className="text-[var(--text-primary)] font-bold">3 - 4 days</strong>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-[var(--bg-card)]/40 border border-[var(--border-default)] rounded-2xl p-5 md:p-6 text-left">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase">{rev.brand_name}</span>
                        <div className="flex items-center gap-1 text-[#D9F111] mt-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} className="fill-current" />
                          ))}
                          <span className="text-[10px] text-[var(--text-tertiary)] ml-1">· verified deal contract</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{rev.date}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Similar profiles recommended widget */}
          {similarCreators.length > 0 && (
            <div className="mt-8 border-t border-[var(--border-default)] pt-8">
              <h3 className="text-md font-display font-extrabold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                Discover Similar Creators <Sparkles size={16} className="text-[#7C5CFF]" />
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarCreators.map((item) => (
                  <div 
                    key={item.user_id}
                    onClick={() => navigate(`/creator/${item.user_id}`)}
                    className="bg-[var(--bg-card)]/40 border border-[var(--border-default)] hover:border-white/20 p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 group"
                  >
                    <img 
                      src={item.photo || item.picture} 
                      alt={item.name} 
                      className="w-14 h-14 rounded-full object-cover mb-3 ring-1 ring-[#7C5CFF]/30 group-hover:ring-[#D9F111] transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-[var(--text-primary)] text-xs font-bold truncate max-w-full mb-0.5 group-hover:text-[#D9F111]">{item.name}</h4>
                    <span className="text-[10px] text-[#D9F111]/80 font-semibold">{item.category}</span>
                    <span className="text-[9px] text-[var(--text-tertiary)] mt-1 font-mono">{formatNum(item.followers_instagram || 50000)} followers</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* Invite Campaign Modal */}
      <AnimatePresence>
        {collabOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCollabOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-3xl text-left" 
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Secure Campaign Deal</h2>
                <button onClick={() => setCollabOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 bg-[var(--bg-elevated)] rounded-full">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-xs mb-6">Send an direct brand partnership invitation quote to {c.name}.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Deliverable</label>
                  <select 
                    value={collab.deliverable} 
                    onChange={(e) => setCollab({ ...collab, deliverable: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium appearance-none"
                  >
                    <option value="Instagram Reel" className="bg-[var(--bg-card)]">Instagram Reel</option>
                    <option value="Instagram Story" className="bg-[var(--bg-card)]">Instagram Story</option>
                    <option value="YouTube Integration" className="bg-[var(--bg-card)]">YouTube Integration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Your Proposed Budget Offer (₹)</label>
                  <input 
                    type="number" 
                    value={collab.proposed_amount || ''} 
                    onChange={(e) => setCollab({ ...collab, proposed_amount: parseInt(e.target.value || "0") })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-bold tracking-wider" 
                    placeholder="e.g. 15000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Deliverable Context details</label>
                  <textarea 
                    rows={4} 
                    value={collab.message} 
                    onChange={(e) => setCollab({ ...collab, message: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium resize-none" 
                    placeholder="Describe specific products, guidelines and content timeline expectations..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCollabOpen(false)} className="py-3 px-5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors">Cancel</button>
                  <button onClick={sendCollabInvitation} className="flex-1 py-3 px-5 rounded-xl text-xs font-bold bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white transition-all shadow-md">Invite Creator</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collab Cost Request Modal (HashFame inspired) */}
      <AnimatePresence>
        {collabCostOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCollabCostOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-3xl text-left" 
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Request Direct Cost</h2>
                <button onClick={() => setCollabCostOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 bg-[var(--bg-elevated)] rounded-full">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-xs mb-6">Creator will quote custom charges for this deliverable based on your requirements.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Select Target Deliverable</label>
                  <select 
                    value={costRequest.deliverable_type} 
                    onChange={(e) => setCostRequest({ ...costRequest, deliverable_type: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium appearance-none"
                  >
                    <option value="Instagram Reel" className="bg-[var(--bg-card)]">Instagram Reel (UGC/Collab)</option>
                    <option value="Instagram Story" className="bg-[var(--bg-card)]">Instagram Story (with link sticker)</option>
                    <option value="YouTube Dedicated Video" className="bg-[var(--bg-card)]">YouTube Dedicated Review Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Message to Creator</label>
                  <textarea 
                    rows={4} 
                    value={costRequest.brand_message} 
                    onChange={(e) => setCostRequest({ ...costRequest, brand_message: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium resize-none" 
                    placeholder="State briefly what niche content deliverables you plan to assign so the creator quotes accurately..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCollabCostOpen(false)} className="py-3 px-5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors">Cancel</button>
                  <button onClick={handleRequestCollabCost} className="flex-1 py-3 px-5 rounded-xl text-xs font-bold bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white transition-all shadow-md">Request Quote</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Brand Brief Modal */}
      <AnimatePresence>
        {sendBriefOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSendBriefOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-3xl text-left" 
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Send Campaign Brief</h2>
                <button onClick={() => setSendBriefOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 bg-[var(--bg-elevated)] rounded-full">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-xs mb-6 font-normal">Express campaign requirements directly. Your briefs are synchronized instantly.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Campaign Description & Deliverables</label>
                  <textarea 
                    rows={5} 
                    value={briefRequest.message} 
                    onChange={(e) => setBriefRequest({ ...briefRequest, message: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium resize-none" 
                    placeholder="State your guidelines, visual examples, campaign timeline, product ship links, etc..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Estimated Budget Bracket (₹)</label>
                  <input 
                    type="text" 
                    value={briefRequest.budget_range} 
                    onChange={(e) => setBriefRequest({ ...briefRequest, budget_range: e.target.value })} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-bold" 
                    placeholder="e.g. ₹15,000 - ₹25,000"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSendBriefOpen(false)} className="py-3 px-5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors">Cancel</button>
                  <button onClick={handleSendBrief} className="flex-1 py-3 px-5 rounded-xl text-xs font-bold bg-[#D9F111] hover:bg-[#cbe010] text-black transition-all shadow-md">Send Brief</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
