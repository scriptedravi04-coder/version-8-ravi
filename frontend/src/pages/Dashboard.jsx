import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import CreatorDashboard from "../components/CreatorDashboard";
import BrandDashboard from "../components/BrandDashboard";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Eye, Users, Megaphone, ArrowRight, Sparkles, 
  Search, Cpu, GraduationCap, Utensils, Dumbbell, Glasses, 
  Landmark, Sparkle, MapPin, CheckCircle2, MessageSquare, 
  PlusCircle, Film, DollarSign, Gift, ChevronRight, X, AlertCircle,
  Briefcase, Bell, Link as LinkIcon, MoreVertical, Share2, Package
} from "lucide-react";

const GREETINGS = [
  { text: "नमस्ते", lang: "Hindi" },
  { text: "ನಮಸ್ಕಾರ", lang: "Kannada" },
  { text: "வணக்கம்", lang: "Tamil" },
  { text: "नमस्कार", lang: "Marathi" },
  { text: "నమస్కారం", lang: "Telugu" },
  { text: "সতশ্রীঅকাল", lang: "Punjabi" },
  { text: "Hello", lang: "English" }
];

const CATEGORIES = [
  { id: "Lifestyle", name: "Lifestyle & Living", icon: Sparkles, color: "from-pink-500/20 to-purple-500/20", textCol: "text-pink-400" },
  { id: "Tech", name: "Tech & Gadgets", icon: Cpu, color: "from-blue-500/20 to-indigo-500/20", textCol: "text-blue-400" },
  { id: "Finance", name: "Finance & Invest", icon: Landmark, color: "from-emerald-500/20 to-teal-500/20", textCol: "text-emerald-400" },
  { id: "Education", name: "Education", icon: GraduationCap, color: "from-amber-500/20 to-orange-500/20", textCol: "text-amber-400" },
  { id: "Fashion", name: "Fashion & Style", icon: Glasses, color: "from-rose-500/20 to-red-500/20", textCol: "text-red-400" },
  { id: "Food", name: "Food & Cooking", icon: Utensils, color: "from-orange-500/20 to-yellow-500/20", textCol: "text-orange-400" },
  { id: "Fitness", name: "Fitness & Health", icon: Dumbbell, color: "from-cyan-500/20 to-blue-500/20", textCol: "text-cyan-400" },
  { id: "Beauty", name: "Beauty & Makeup", icon: Sparkle, color: "from-purple-500/20 to-fuchsia-500/20", textCol: "text-purple-400" }
];

const CITIES = [
  { name: "Mumbai", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=300", tag: "Glamour & Scale" },
  { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=300", tag: "Cultural Hub" },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=300", tag: "Silicon Valley" },
  { name: "Gurgaon", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=300", tag: "Corporate Elite" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1608958416719-79bcbd412f7a?auto=format&fit=crop&q=80&w=300", tag: "Heritage Tech" },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=300", tag: "Southern Arts" },
  { name: "Kolkata", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80&w=300", tag: "Intellectual Base" },
  { name: "Pune", image: "https://images.unsplash.com/photo-1601931131911-37d36a7ed2d2?auto=format&fit=crop&q=80&w=300", tag: "Youth & College" }
];

const FALLBACK_CREATORS = [
  {
    user_id: "creator1",
    name: "Arti Kumari",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    category: "Beauty & Fashion",
    city: "Mumbai",
    performance_score: 96,
    followers_total: "1.2M",
    rate_from: "₹15k"
  },
  {
    user_id: "creator2",
    name: "Rashmi Gautam",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    category: "Entertainment",
    city: "Delhi",
    performance_score: 91,
    followers_total: "850K",
    rate_from: "₹8.5k"
  },
  {
    user_id: "creator3",
    name: "Sanwaliya Seth",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    category: "Lifestyle",
    city: "Jaipur",
    performance_score: 88,
    followers_total: "520K",
    rate_from: "₹5.0k"
  },
  {
    user_id: "creator4",
    name: "Vinuo Angami",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    category: "Travel",
    city: "Bangalore",
    performance_score: 93,
    followers_total: "240K",
    rate_from: "₹6.0k"
  }
];

const MarketTrendsSlider = ({ stats }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: "Growth Snapshot",
      subtitle: "Profile Visited",
      value: typeof stats?.profile_views === 'number' ? stats.profile_views : 0,
      trend: "up",
      subValue: "vs last week",
      icon: <TrendingUp size={16} color="#10B981" />,
      bgIcon: (
        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-xl bg-emerald-500">
          <Eye className="w-[24px] h-[24px] text-white" strokeWidth={1.5} />
        </div>
      )
    },
    {
      title: "Active Opportunities",
      subtitle: "Ongoing Collabs",
      value: typeof stats?.collab_requests === 'number' ? stats.collab_requests : 0,
      trend: "up",
      subValue: "Active right now",
      icon: <TrendingUp size={16} color="#10B981" />,
      bgIcon: (
        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-xl bg-[#7C5CFF]">
          <Package className="w-[24px] h-[24px] text-white" strokeWidth={1.5} />
        </div>
      )
    },
    {
      title: "Impact Metric",
      subtitle: "Avg. Engagement",
      value: `${typeof stats?.engagement_rate === 'number' ? stats.engagement_rate : 0}%`,
      trend: "up",
      subValue: "Above average",
      icon: <TrendingUp size={16} color="#10B981" />,
      bgIcon: (
        <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-xl bg-blue-500">
          <Share2 className="w-[24px] h-[24px] text-white" strokeWidth={1.5} />
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5 w-full relative overflow-hidden shadow-sm flex flex-col justify-between" style={{ minHeight: '160px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[13px] font-semibold text-[var(--text-secondary)]">{slides[currentIndex].title}</span>
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
          
          <div className="flex items-end justify-between z-10 w-full mt-2">
            <div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">{slides[currentIndex].subtitle}</div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">{slides[currentIndex].value}</span>
                {slides[currentIndex].trend === "down" ? (
                  <TrendingDown size={18} color="#DC2626" className="mt-1" />
                ) : slides[currentIndex].trend === "up" ? (
                  <TrendingUp size={18} color="#10B981" className="mt-1" />
                ) : null}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1.5">{slides[currentIndex].subValue}</div>
            </div>
            
            {slides[currentIndex].bgIcon}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-4 bg-[#7C5CFF]" : "w-1.5 bg-[var(--text-tertiary)]"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [collabs, setCollabs] = useState({ sent: [], received: [], waves_received: [] });
  const [campaigns, setCampaigns] = useState([]);
  const [dbCreators, setDbCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  const [appliedPresets, setAppliedPresets] = useState([]); // presets applied to
  const [brandKyc, setBrandKyc] = useState(null);
  
  // Pick random greeting
  const nativeGreeting = useMemo(() => {
    const idx = Math.floor(Math.random() * GREETINGS.length);
    return GREETINGS[idx];
  }, []);

  useEffect(() => {
    api.get("/dashboard/stats").then(({data})=>setStats(data)).catch(()=>{});
    api.get("/collabs").then(({data})=>setCollabs(data)).catch(()=>{});
    
    // Fetch live creators for rich feed list
    api.get("/creators").then(({data}) => {
      if (Array.isArray(data)) setDbCreators(data);
    }).catch(()=>{});

    if (user?.role === "brand") {
      api.get("/campaigns?mine=true").then(({data})=>setCampaigns(data)).catch(()=>{});
      api.get("/verifications/me").then(({data})=>setBrandKyc(data)).catch(()=>{});
    } else {
      api.get("/campaigns?limit=5").then(({data})=>setCampaigns(data.slice(0,5))).catch(()=>{});
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  if (user?.role === "admin") return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/explore?category=${encodeURIComponent(catName)}`);
  };

  const handleCityClick = (cityName) => {
    navigate(`/explore?city=${encodeURIComponent(cityName)}`);
  };

  const startChatWithCreator = (creatorId) => {
    navigate(`/chat/${creatorId}`);
  };

  const isCreator = user?.role === "creator";

  // Dynamic greeting based on current local time
  const localHour = new Date().getHours();
  const timeGreeting = localHour < 12 ? "Good Morning" : localHour < 17 ? "Good Afternoon" : "Good Evening";
  const userName = user?.name || "Creator";
  const firstName = userName.split(" ")[0];
  const fullGreeting = `${timeGreeting}, ${firstName}`;
  const [isNotificationBarOpen, setIsNotificationBarOpen] = useState(false);

  // Filter pocket friendly and recently connected creators
  const displayCreators = dbCreators.length > 0 ? dbCreators : FALLBACK_CREATORS;
  const recentCreators = useMemo(() => displayCreators.slice(0, 4), [displayCreators]);
  const economicCreators = useMemo(() => {
    return [...displayCreators].reverse().slice(0, 4);
  }, [displayCreators]);

  // RENDER CREATOR DASHBOARD
  if (isCreator) {
    return <CreatorDashboard user={user} />;
  }

  // RENDER COMPLETE BRAND DASHBOARD
  if (user?.role === "brand") {
    return <BrandDashboard user={user} stats={stats} />;
  }

  // RENDER BRAND DASHBOARD (MATCHES THE BRAND VISUAL INTERFACE COMPITITOR EXACTLY WITH ADDED UGC INTEGRATION!)
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 relative pb-16">
      {/* Decorative radial gradients on top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#7C5CFF]/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />

      {/* Hero Header bar */}
      <header className="relative max-w-6xl ml-0 mr-auto px-4 pt-6 sm:pt-10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[var(--border-strong)] overflow-hidden ring-2 ring-[#7C5CFF]/20 bg-[var(--bg-elevated)]">
            <img 
              src={user?.photo || user?.picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"} 
              alt={user?.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold tracking-wide text-[var(--text-secondary)] flex items-center gap-1 leading-none">
              <span className="text-[#9D7CFF] font-black">{nativeGreeting.text}</span>
            </div>
            <div className="text-lg font-bold font-display text-[var(--text-primary)] mt-1">{user?.name}</div>
          </div>
        </div>

        {/* Invite & Earn Badge (Exact replica of competitor UI) */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-green-900/25 to-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-emerald-950/20 max-w-[190px] text-right transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative">
            <div className="absolute -inset-1 bg-yellow-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
            <span className="relative text-lg sm:text-2xl">💵</span>
          </div>
          <div>
            <div className="text-[9px] text-[#D9F111] font-black uppercase tracking-wider">Invite & Earn</div>
            <div className="text-xs sm:text-sm font-black text-foreground">₹2,500<span className="text-[#D9F111]">+</span></div>
          </div>
        </div>
      </header>

      {/* Brand Compliance Banner */}
      {(!brandKyc || brandKyc.status !== "approved") && (
        <div className="relative max-w-6xl ml-0 mr-auto px-4 mt-6 z-10">
          {brandKyc?.status === "pending" ? (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">⏳</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Brand Certification Review Pending</h4>
                  <p className="text-xs text-white/50 mt-1">Our compliance team is verifying your business GST Certificate, authorization liaison, and company credentials manually. Standard duration is 24-48 hours.</p>
                </div>
              </div>
              <Link to="/settings?section=kyc#kyc-section" className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-bold text-xs rounded-xl uppercase border border-yellow-500/20 transition-all shrink-0">Track Review</Link>
            </div>
          ) : brandKyc?.status === "rejected" ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">❌</span>
                <div>
                  <h4 className="text-sm font-bold text-red-400">Compliance Verification Corrective Fix Required</h4>
                  <p className="text-xs text-white/50 mt-1">Reason: "{brandKyc.review_note || "Documents were blurry or invalid."}". Please edit and resubmit correct brand details to activate listing capabilities.</p>
                </div>
              </div>
              <Link to="/settings?section=kyc#kyc-section" className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl uppercase border border-red-500/20 transition-all shrink-0">Fix & Resubmit</Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-500/10 via-[#131326]/50 to-transparent border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-100 border border-red-500/20 shrink-0 animate-pulse">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider text-red-400">Corporate KYC Compliance Required</h4>
                  <p className="text-xs text-white/50 mt-1">To protect transparent escrow interactions, brands are restricted from publishing campaigns or vertical UGC brief orders until GST and PAN credentials are submitted & approved.</p>
                </div>
              </div>
              <Link to="/settings?section=kyc#kyc-section" className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl uppercase shadow-lg shadow-red-900/40 transition-all shrink-0">Add Credentials</Link>
            </div>
          )}
        </div>
      )}

      {/* Hero Section Title */}
      <section className="relative text-left max-w-4xl ml-0 mr-auto px-4 pt-10 pb-8 z-10 flex flex-col items-start w-full">
        <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight leading-snug max-w-2xl text-left text-[var(--text-primary)]">
          Connect with <br />
          the right creators, <br />
          <span className="text-[var(--text-primary)] font-normal italic relative">
            fast
            {/* Elegant lighting stroke icon behind fast */}
            <span className="absolute -right-6 -top-1 font-bold text-[#D9F111] animate-pulse">⚡</span>
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] tracking-wider mt-4 uppercase">
          ✦ 100K+ Vetted Creative-Experts & UGC Creators ✦
        </p>

        {/* DOUBLE BUTTON PILL HERO SECTION (Custom Styled with UGC action choice embedded!) */}
        <div className="mt-8 bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-strong)] p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-lg w-full backdrop-blur-md shadow-2xl transition-all duration-300">
          <Link 
            to="/explore"
            className="flex-1 filter hover:brightness-110 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 text-foreground text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all transform hover:scale-[1.01]"
          >
            <Search size={14} /> Browse Creators
          </Link>
          <button 
            onClick={() => setShowPostRequestModal(true)}
            className="flex-1 filter hover:brightness-110 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all transform hover:scale-[1.01] shadow-lg shadow-purple-900/10"
          >
            <PlusCircle size={14} /> Post a request
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--text-tertiary)] italic font-semibold tracking-wide">
          *Get creator connections starting in just 2 mins
        </p>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-8 relative z-10 w-full">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-primary)]">Creator categories</h2>
            <p className="text-xs text-[var(--text-secondary)]">And 140+ sub-categories, inside</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-[#D9F111] flex items-center gap-1 group">
            View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scrollable Categories Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#7C5CFF]/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[var(--bg-elevated)] transform hover:scale-[1.03]"
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} ${cat.textCol}`}>
                <cat.icon size={20} />
              </div>
              <span className="text-xs font-bold tracking-tight text-[var(--text-primary)]">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* QUICK PROMPT SEARCH: WHO ARE YOU LOOKING FOR */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-6 relative z-10 w-full">
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all text-left">
          <h3 className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3">Who are you looking for?</h3>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-hidden">
            <span className="pl-4 text-[var(--text-tertiary)] text-xs sm:text-sm font-semibold pointer-events-none">🍿 Looking for</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="10 nano fitness creators, budget 1L..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-[var(--text-primary)] py-3 pl-2 pr-12 focus:ring-0 outline-none placeholder-[var(--text-tertiary)] font-medium"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#D9F111] hover:bg-[#D9F111]/90 flex items-center justify-center text-black"
            >
              <span className="text-lg font-black">+</span>
            </button>
          </form>
          <p className="mt-2 text-[10px] text-[var(--text-tertiary)] font-medium">Post exact specs & let multiple interested creators apply with pitches!</p>
        </div>
      </section>

      {/* LIVE BRANDS RECENTLY CONNECTED SECTION */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-8 relative z-10 w-full">
        <div className="flex items-end justify-between mb-5">
          <div className="text-left">
            <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-primary)]">Brands recently connected with</h2>
            <p className="text-xs text-[var(--text-secondary)]">Most popular collaborative experts on Ybex</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-[#D9F111] flex items-center gap-1 group">
            View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Creator List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {recentCreators.map((c, i) => (
            <div key={c.user_id || i} className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#7C5CFF]/30 p-3.5 rounded-2xl flex flex-col items-center text-center transition-all shadow-sm">
              <div className="relative w-20 h-20 rounded-full border border-[var(--border-default)] overflow-hidden mb-3">
                <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 border border-foreground/25">
                  <CheckCircle2 size={10} className="text-foreground"/>
                </div>
              </div>
              <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] leading-tight">{c.name}</h3>
              <p className="text-[10px] text-[#9D7CFF] font-semibold uppercase tracking-wider mt-0.5">{c.category}</p>
              <div className="flex items-center gap-3 mt-3 w-full border-t border-[var(--border-default)] pt-2 justify-center text-[11px] text-[var(--text-secondary)]">
                <div>
                  <div className="font-mono text-[var(--text-primary)] font-bold">{c.followers_total || "450K"}</div>
                  <div className="text-[9px] uppercase">Reach</div>
                </div>
                <div className="w-[1px] h-4 bg-[var(--border-default)]"></div>
                <div>
                  <div className="font-mono text-[var(--text-primary)] font-bold">{c.rate_from || "₹5k"}</div>
                  <div className="text-[9px] uppercase font-semibold">Start</div>
                </div>
              </div>
              <button 
                onClick={() => startChatWithCreator(c.user_id)}
                className="mt-4 px-4 py-1.5 bg-indigo-600/10 hover:bg-[#7C5CFF]/20 text-[var(--text-primary)] border border-[#7C5CFF]/40 hover:border-[#7C5CFF]/80 rounded-xl text-xs font-black uppercase tracking-wider transition-all w-full flex items-center justify-center gap-1"
              >
                <MessageSquare size={13} /> Contact
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CHANNELS SELECT+ BANNER */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-6 relative z-10 w-full">
        <div className="bg-gradient-to-r from-card via-background to-background border border-fuchsia-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#7C5CFF]/20 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="relative">
            <span className="px-2.5 py-1 bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 rounded-full text-[10px] font-black uppercase tracking-widest">
              ✨ Select+ Priority Badge
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-foreground leading-tight mt-3">
              Get 3x faster response from verified creators
            </h3>
            <p className="text-xs text-foreground/60 mt-1 max-w-md">
              Select+ authenticated brands get instant auto-notified responses, dedicated agency protection, and safe payout reserves.
            </p>
          </div>
          <button 
            onClick={() => toast.success("Select+ inquiry sent! Our team will verify your brand and activate priority benefits shortly.")}
            className="px-5 py-2.5 bg-[#D9F111] hover:bg-[#D9F111]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
          >
            Apply Now
          </button>
        </div>
      </section>

      {/* CONTROLLABLE POCKET FRIENDLY CREATORS */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-8 relative z-10 w-full">
        <div className="flex items-end justify-between mb-5">
          <div className="text-left">
            <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-primary)]">Pocket friendly creators</h2>
            <p className="text-xs text-[var(--text-secondary)]">Suitable, vetted creators perfect for scaling with budgets</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-[#D9F111] flex items-center gap-1 group">
            View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Creator List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {economicCreators.map((c, i) => (
            <div key={c.user_id || i} className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#7C5CFF]/30 p-3.5 rounded-2xl flex flex-col items-center text-center transition-all shadow-sm">
              <div className="relative w-20 h-20 rounded-full border border-[var(--border-default)] overflow-hidden mb-3">
                <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] leading-tight">{c.name}</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5">{c.city}</p>
              <div className="bg-[#D9F111]/10 border border-[#D9F111]/30 text-[#D9F111] rounded-lg px-2.5 py-1 text-[11px] font-black mt-3 uppercase tracking-wider">
                Vetted Budget: {c.rate_from || "₹1,500"}
              </div>
              <button 
                onClick={() => startChatWithCreator(c.user_id)}
                className="mt-4 px-4 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--violet-soft)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all w-full flex items-center justify-center gap-1"
              >
                <MessageSquare size={12} /> Chat Brief
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CREATORS BY LOCATION */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-10 relative z-10 w-full">
        <div className="flex items-end justify-between mb-5">
          <div className="text-left">
            <h2 className="text-xl font-bold font-display tracking-tight text-[var(--text-primary)]">Creators by location</h2>
            <p className="text-xs text-[var(--text-secondary)]">Find regional experts across 1600+ cities</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-[#D9F111] flex items-center gap-1 group">
            View all cities <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* City Grid cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCityClick(city.name)}
              className="group relative h-28 rounded-2xl overflow-hidden border border-foreground/10 hover:border-[#7C5CFF]/50 transition-all transform hover:scale-[1.02]"
            >
              {/* Blur-overlay and image */}
              <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors z-10" />
              <img src={city.image} alt={city.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              <div className="absolute inset-0 p-3.5 flex flex-col justify-end z-20 text-left">
                <span className="text-xs text-[#D9F111]/90 font-bold tracking-wide uppercase">{city.tag}</span>
                <span className="font-display font-black text-lg text-foreground leading-tight mt-0.5">{city.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* BEYOND INFLUENCERS THEMATIC SECTION (Celebs, Agencies, etc.) */}
      <section className="max-w-6xl ml-0 mr-auto px-4 py-6 relative z-10 w-full">
        <h3 className="text-xl font-bold font-display text-[var(--text-primary)] mb-4">Beyond influencers</h3>
        <p className="text-xs text-[var(--text-secondary)] -mt-3 mb-5">Access premium representation channels directly</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-left">
          {[
            { name: "Celebs & Actors", tone: "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-300", emoji: "🎭" },
            { name: "Publishers & Media", tone: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-300", emoji: "📰" },
            { name: "Talent Agencies", tone: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-300", emoji: "🌟" },
            { name: "Meme Pages & More", tone: "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-300", emoji: "🤪" }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/explore?q=${encodeURIComponent(item.name)}`)}
              className={`p-5 rounded-2xl border ${item.tone} hover:brightness-110 cursor-pointer flex flex-col justify-between h-28 transform hover:scale-[1.02] transition-all`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="font-display font-black text-xs sm:text-sm tracking-wide uppercase leading-tight">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* POPUP / MODAL CHOOSE CAMPAIGN TYPE (Standard Campaign vs Live UGC Order) */}
      {showPostRequestModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-elevated border border-foreground/10 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setShowPostRequestModal(false)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-foreground p-2 rounded-full hover:bg-foreground/5 transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <span className="text-3xl">🚀</span>
              <h3 className="font-display text-2xl font-black text-foreground mt-3">Post a Request Brief</h3>
              <p className="text-xs text-foreground/60 mt-1">Select the best workflow to meet your timeline and budget targets</p>
            </div>

            <div className="space-y-4 text-left">
              {/* Option 1: Live UGC Video Order (The requested UGC addon!) */}
              <button
                onClick={() => {
                  setShowPostRequestModal(false);
                  navigate("/ugc-orders");
                }}
                className="w-full p-4 bg-[#D9F111]/10 border border-[#D9F111]/30 hover:border-[#D9F111] hover:bg-[#D9F111]/20 rounded-2xl text-left flex items-start gap-3 transition-all transform hover:scale-[1.02]"
              >
                <div className="p-2.5 bg-[#D9F111]/15 text-[#D9F111] rounded-xl">
                  <Film size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-[#D9F111] flex items-center gap-1.5">
                    Live UGC video orders <span className="text-[9px] bg-[#D9F111] text-black font-black px-1.5 py-0.5 rounded uppercase">24h Express</span>
                  </div>
                  <div className="text-xs text-foreground/70 mt-1">
                    Post dynamic creator brief task requests. Local verified creators deliver mobile video assets within 24 hours via safe escrow holding.
                  </div>
                </div>
              </button>

              {/* Option 2: Standard Creator Campaign */}
              <button
                onClick={() => {
                  setShowPostRequestModal(false);
                  navigate("/campaigns?new=true");
                }}
                className="w-full p-4 bg-foreground/3 hover:bg-foreground/5 border border-foreground/10 hover:border-foreground/20 rounded-2xl text-left flex items-start gap-3 transition-all transform hover:scale-[1.02]"
              >
                <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl">
                  <Megaphone size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">
                    Standard brand Campaign 
                  </div>
                  <div className="text-xs text-foreground/50 mt-1">
                    Detailed brand campaigns. Receive pitch proposals, milestones tracking, and build long-term relationships.
                  </div>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-foreground/30 text-center mt-6">
              Authenticated securely via neutral escrow protection framework.
            </p>
          </div>
        </div>
      )}
      <NotificationSidebar isOpen={isNotificationBarOpen} onClose={() => setIsNotificationBarOpen(false)} />
    </div>
  );
}

const NotificationSidebar = ({ isOpen, onClose }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        />
      )}
      {isOpen && (
        <motion.div
          key="sidebar"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-[85vw] max-w-[350px] bg-[var(--bg-surface)] border-l border-[var(--border-default)] z-[101] shadow-2xl flex flex-col"
        >
          <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#7C5CFF]" />
              <h2 className="text-lg font-bold font-display text-[var(--text-primary)]">Notifications</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-8">
            {/* Dummy Notifications */}
            <div className="p-4 bg-[var(--bg-elevated)] border border-[#7C5CFF]/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center shrink-0">
                  <span className="animate-pulse">🔔</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Welcome to Ybex!</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Complete your profile to unlock premium brand collaborations.</p>
                  <span className="text-[10px] text-[var(--text-secondary)]/50 mt-2 block font-medium">Just now</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Briefcase size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">You're available for work</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Your status is set to active. Brands can now see you in explore.</p>
                  <span className="text-[10px] text-[var(--text-secondary)]/50 mt-2 block font-medium">2 hours ago</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center text-center opacity-50 px-4">
              <Bell size={24} className="mb-2 text-[var(--text-secondary)]" />
              <p className="text-xs text-[var(--text-secondary)]">No more new notifications</p>
              <p className="text-[10px] text-[var(--text-secondary)]/60 mt-1">We'll alert you when there's an update</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const StatBlock = ({ icon, label, value, accent }) => (
  <div className={`p-4 sm:p-5 rounded-2xl border ${accent ? "bg-indigo-600/5 dark:bg-[#7C5CFF]/10 text-[var(--text-primary)] border-[#7C5CFF]/30" : "bg-[var(--bg-card)] border-[var(--border-default)]"} hover:-translate-y-0.5 transition-transform shadow-sm text-left`}>
    <div className="flex items-center justify-between"><div className="text-[#9D7CFF]">{icon}</div></div>
    <div className="font-display text-2xl sm:text-3xl mt-3 font-bold text-[var(--text-primary)]">{value}</div>
    <div className="text-[10px] tracking-wider uppercase text-[var(--text-secondary)] font-bold mt-1.5 leading-none">{label}</div>
  </div>
);

