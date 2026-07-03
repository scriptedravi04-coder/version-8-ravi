const fs = require('fs');

const code = `import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence, animate } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { 
  Eye, Users, Megaphone, DollarSign, ArrowRight, Share2, Package, Check, 
  MapPin, Gift, ChevronRight, X, Briefcase, Bell, Link as LinkIcon, AlertCircle,
  Search, Power, TrendingUp, Sparkles, Film, Wallet, User, ShieldAlert, FileText, Heart
} from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import NotificationBell from "./NotificationBell";

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
  return Math.round(num);
};

const AnimatedNumber = ({ value, prefix = "", format = false }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v)
    });
    return controls.stop;
  }, [value]);
  
  const formatted = format ? formatNumber(display) : Math.floor(display);
  return <span>{prefix}{formatted}</span>;
};

export default function CreatorDashboard({ user }) {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({ profile_views: 0, profile_reach: 0, portfolio: "" });
  const [collabCount, setCollabCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  const [widgetIndex, setWidgetIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      startLoading();
      try {
        setProfile({ profile_views: 1200, profile_reach: 48200, portfolio: "" });
        setCollabCount(4);
        setMonthlyEarnings(48500);
      } catch (e) {
        console.warn('Silent fail Dashboard shell', e);
      } finally {
        stopLoading();
        if (mounted) setLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWidgetIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const generateChartData = () => {
    return [
      { name: 'Week 1', profile_views: 300, collab_interest: 5 },
      { name: 'Week 2', profile_views: 420, collab_interest: 8 },
      { name: 'Week 3', profile_views: 550, collab_interest: 12 },
      { name: 'Week 4', profile_views: 680, collab_interest: 15 }
    ];
  };

  const CHART_DATA = generateChartData();

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 py-8 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl w-1/3 mb-8"></div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(k => <div key={k} className="h-24 bg-gray-100 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const firstName = (user?.name || "Ravi").split(" ")[0];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pb-12 px-4 bg-[#F8F9FA] min-h-screen">
      {/* Header Area */}
      <div className="mb-6 flex justify-between items-center pt-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
             <img src="https://i.pravatar.cc/150?u=ravi" alt="Avatar" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Hey, {firstName} 👋
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Ready to grow your brand today?
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative shadow-sm hover:bg-gray-50 transition-colors">
            <Bell size={18} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--violet)] rounded-full text-white text-[10px] font-bold flex items-center justify-center border border-white">3</div>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative shadow-sm hover:bg-gray-50 transition-colors">
            <MessageCircle size={18} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--violet)] rounded-full text-white text-[10px] font-bold flex items-center justify-center border border-white">6</div>
          </button>
          
          <button className="px-5 py-2.5 rounded-full bg-white border border-gray-200 font-bold text-sm text-gray-800 shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            Creator Profile <Share2 size={14} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronRight size={18} className="text-gray-600 rotate-90" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* 75% Width Auto-Sliding Banner */}
        <div className="lg:col-span-3 bg-white rounded-[1.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[300px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
           <div className="absolute inset-0 bg-gradient-to-br from-[var(--violet)]/5 to-transparent pointer-events-none"></div>
           
           <div className="relative z-10 max-w-sm">
             <div className="inline-flex items-center px-4 py-1.5 bg-[var(--violet)] rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-6 shadow-sm">
               NEW CAMPAIGNS LIVE
             </div>
             
             <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4">
               <span className="text-gray-800">5 New Campaigns</span><br/>This Week<span className="text-[var(--violet)]">.</span>
             </h3>
             <p className="text-gray-500 text-sm md:text-base mb-8 font-medium">
               Top brands. Real budgets. Right creators.
             </p>

             <button className="bg-[var(--violet)] hover:bg-[#6b3deb] text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_8px_20px_rgba(138,79,255,0.3)] w-fit">
               Explore Campaigns <ArrowRight size={16} />
             </button>
           </div>
           
           {/* Floating Brand Elements */}
           <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none hidden md:block">
              {/* Decorative blobs/images matching the screenshot */}
              <div className="absolute top-[10%] right-[40%] bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 rotate-[-5deg] w-24">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop" className="w-full h-auto rounded-xl" alt="Shoe" />
              </div>
              <div className="absolute top-[20%] right-[15%] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4 rotate-[10deg]">
                <span className="font-black text-xl tracking-tighter">boAt</span>
              </div>
              <div className="absolute bottom-[25%] right-[55%] bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[-10deg]">
                <span className="font-black text-[#00A859] tracking-tighter text-lg">mCaffeine</span>
              </div>
              <div className="absolute bottom-[35%] right-[30%] bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[5deg]">
                <span className="font-bold text-[#00AFEF] tracking-tight">mamaearth</span>
              </div>
              <div className="absolute bottom-[10%] right-[45%] bg-[#E23744] text-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[-5deg] z-10">
                <span className="font-black tracking-tighter">zomato</span>
              </div>
              <div className="absolute top-[40%] right-[5%] bg-[#E80071] text-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[15deg]">
                <span className="font-black tracking-widest text-sm">NYKAA</span>
              </div>
              
              {/* Creator Portraits */}
              <div className="absolute bottom-0 right-[10%] w-48 h-64 overflow-hidden z-0">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover rounded-t-[2rem]" alt="Creator" />
              </div>
           </div>
           
           {/* Dots */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
             <div className="h-1.5 w-6 bg-[var(--violet)] rounded-full"></div>
             <div className="h-1.5 w-6 bg-gray-300 rounded-full"></div>
             <div className="h-1.5 w-6 bg-gray-300 rounded-full"></div>
           </div>
        </div>

        {/* 25% Important For You */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">IMPORTANT FOR YOU</h4>
            <button className="text-xs font-bold text-[var(--violet)] hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-[#5B45FF] text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm text-gray-900 truncate">Complete your KYC</h5>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">Verify your identity to unlock all features</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm text-gray-900 truncate">Add your Rate Card</h5>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">Increase your chances of getting hired</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm text-gray-900 truncate">2 Payments Pending</h5>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">Add bank details to receive your payments</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Compact Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {[
           { icon: Eye, label: "Profile Views", value: 1200, format: true, trend: "↑ 18% this week", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 25 L20 15 L40 20 L60 5 L80 15 L100 0", stroke: "var(--violet)" },
           { icon: Heart, label: "Brand Interest", value: 32, trend: "↑ 12% this week", color: "text-rose-500", bg: "bg-rose-500/10", chartLine: "M0 20 L20 25 L40 10 L60 15 L80 5 L100 10", stroke: "#f43f5e" },
           { icon: Briefcase, label: "Active Deals", value: 4, sub: "2 in review", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 10 L20 5 L40 15 L60 10 L80 20 L100 15", stroke: "var(--violet)" },
           { icon: Wallet, label: "Earnings (This Month)", value: monthlyEarnings, prefix: "₹", format: true, trend: "↑ 22% vs last month", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 25 L20 20 L40 15 L60 20 L80 5 L100 0", stroke: "var(--violet)" }
         ].map((s, i) => (
           <div key={i} className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-4 z-10 relative">
               <div className={\`w-10 h-10 rounded-full \${s.bg} \${s.color} flex items-center justify-center\`}>
                 <s.icon size={18} />
               </div>
               <span className="text-xs font-bold text-gray-500">{s.label}</span>
             </div>
             
             <div className="flex flex-col z-10 relative">
                <div className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
                  <AnimatedNumber value={s.value} format={s.format} prefix={s.prefix} />
                </div>
                {s.trend ? (
                  <div className="text-[11px] font-bold text-emerald-500">
                    {s.trend}
                  </div>
                ) : (
                  <div className="text-[11px] font-bold text-gray-400">
                    {s.sub}
                  </div>
                )}
             </div>
             
             {/* Mini sparkline chart */}
             <div className="absolute right-4 bottom-4 w-1/3 h-10 opacity-40">
               <svg viewBox="0 0 100 30" className="w-full h-full fill-none stroke-[3px] stroke-linecap-round stroke-linejoin-round" preserveAspectRatio="none">
                 <path d={s.chartLine} stroke={s.stroke} />
               </svg>
             </div>
           </div>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Recommended Campaigns) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recommended Opportunities</h3>
             <button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { name: 'Fitness Creator\nCampaign', brand: 'Nike', brandLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', price: '₹18K - ₹30K', d: '5 Days Left', t: 'Reels • 2', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop', new: true },
               { name: 'Skincare UGC\nCampaign', brand: 'Mamaearth', brandLogo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop', price: '₹12K - ₹22K', d: '7 Days Left', t: 'Reels • 2', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop', new: false },
               { name: 'Food Creator\nCampaign', brand: 'Zomato', brandLogo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop', price: '₹15K - ₹25K', d: '4 Days Left', t: 'Shorts • 3', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop', new: false }
             ].map((c, i) => (
               <div key={i} className="group bg-white rounded-[1.5rem] border border-gray-100 flex flex-col h-[340px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                  <div className="p-5 flex justify-between items-start">
                     {c.new ? (
                       <span className="bg-[var(--violet)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">New</span>
                     ) : (
                       <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full opacity-0"></div>
                     )}
                     <div className="w-8 h-8 flex items-center justify-center">
                        <img src={c.brandLogo} alt={c.brand} className="max-w-full max-h-full object-contain" />
                     </div>
                  </div>

                  <div className="px-5 mt-auto pb-4">
                     <h4 className="font-bold text-gray-900 mb-1 leading-tight">{c.brand}</h4>
                     <p className="text-xs text-gray-500 font-medium mb-4 whitespace-pre-line leading-relaxed">{c.name}</p>
                     
                     <div className="text-[var(--violet)] font-bold text-lg mb-3 tracking-tight">{c.price}</div>
                     
                     <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 mb-4">
                       <span className="flex items-center gap-1.5"><Film size={12} /> {c.t}</span>
                       <span className="flex items-center gap-1.5"><AlertCircle size={12} /> {c.d}</span>
                     </div>
                  </div>
                  
                  {/* Image overlay side / bottom */}
                  <div className="absolute right-0 bottom-16 w-[45%] h-[45%] pointer-events-none">
                     <img src={c.img} alt={c.brand} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
                  </div>

                  <div className="mt-auto border-t border-gray-100 flex">
                     <button className="flex-1 py-3 text-xs font-bold text-gray-800 hover:text-[var(--violet)] transition-colors flex justify-center items-center gap-2">
                       View Details <ArrowRight size={14} className="opacity-70" />
                     </button>
                  </div>
               </div>
             ))}
          </div>

          <div className="mt-8 flex justify-between items-center mb-2">
             <h3 className="text-lg font-bold text-gray-900 tracking-tight">Your Active Deals</h3>
             <button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>
          </div>
          <div className="flex gap-2">
            <button className="bg-[var(--violet)] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">All</button>
            <button className="bg-white text-gray-600 border border-gray-200 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">In Progress</button>
            <button className="bg-white text-gray-600 border border-gray-200 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">Pending Review</button>
            <button className="bg-white text-gray-600 border border-gray-200 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">Completed</button>
          </div>
        </div>

        {/* Right Column (Brand Interest & Creator Score) */}
        <div className="flex flex-col gap-6">
          
          {/* Brand Interest Panel */}
          <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 tracking-tight">Brand Interest</h4>
              <button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                { n: 'Aesop', a: 'Viewed your profile', t: '2h ago', bg: 'bg-black', color: 'text-white' },
                { n: 'Glossier', a: 'Saved your profile', t: '1d ago', bg: 'bg-rose-100', color: 'text-rose-500' },
                { n: 'Allbirds', a: 'Interested in collab', t: '2d ago', bg: 'bg-gray-900', color: 'text-white' }
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs \${b.bg} \${b.color}\`}>
                      {b.n.substring(0, b.n === 'Aesop' ? 5 : b.n === 'Glossier' ? 1 : 8)}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-900 mb-0.5">{b.n}</h5>
                      <p className="text-xs font-medium text-gray-500">{b.a}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">{b.t}</span>
                    <div className="w-2 h-2 rounded-full bg-[var(--violet)]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creator Score Card */}
          <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
             <div className="w-full flex justify-between items-center mb-6">
               <h4 className="text-lg font-bold text-gray-900 tracking-tight">Creator Score</h4>
               <span className="bg-[var(--violet)] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><Sparkles size={10}/> Pro</span>
             </div>
             
             <div className="flex items-center justify-between w-full">
               <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="40" className="stroke-gray-100 fill-none" strokeWidth="8" />
                   <circle cx="50" cy="50" r="40" className="stroke-[var(--violet)] fill-none" strokeWidth="8" strokeDasharray="251" strokeDashoffset="20" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-black text-gray-900 tracking-tight">92</span>
                   <span className="text-[10px] font-bold text-gray-400 mt-0.5">/100</span>
                 </div>
               </div>
               
               <div className="text-left ml-4">
                 <h5 className="font-bold text-sm text-gray-900 mb-1">Excellent work!</h5>
                 <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                   You're among top 8% creators in Food niche.
                 </p>
                 <button className="text-[11px] font-bold text-[var(--violet)] hover:underline flex items-center gap-1 mt-2">
                   View Insights <ArrowRight size={10} />
                 </button>
               </div>
             </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
`;

fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
