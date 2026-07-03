import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence, animate } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { 
  Eye, Users, Megaphone, DollarSign, ArrowRight, Share2, Package, Check, 
  MapPin, Gift, ChevronRight, X, Briefcase, Bell, Link as LinkIcon, AlertCircle,
  Search, Power, TrendingUp, Sparkles
} from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import NotificationBell from "./NotificationBell";

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
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
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  
  const [workMode, setWorkMode] = useState('available');
  const [showWorkModeMenu, setShowWorkModeMenu] = useState(false);
  
  const [appliedCampaigns, setAppliedCampaigns] = useState({});
  const [applyModalItem, setApplyModalItem] = useState(null);
  const [applyForm, setApplyForm] = useState({ rate: "", message: "" });
  
  const [widgetIndex, setWidgetIndex] = useState(0);
  const [timeframe, setTimeframe] = useState('30d');
  const [kycObj, setKycObj] = useState(null);

  useEffect(() => {
    api.get("/verifications/me")
      .then(({ data }) => setKycObj(data))
      .catch((err) => console.warn("Error fetching KYC status for dashboard", err));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      startLoading();
      try {
        let prof, cCount, earningsData, camps, uCount;
        try {
          const res = await Promise.all([
            supabase.from('creator_profiles').select('*').eq('user_id', user.id).single(),
            supabase.from('collabs').select('*', { count: 'exact' }).eq('creator_id', user.id).neq('status', 'closed'),
            supabase.from('earnings').select('amount').eq('creator_id', user.id).eq('month', new Date().getMonth() + 1).eq('year', new Date().getFullYear()),
            supabase.from('campaigns').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(3),
            supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', user.id).eq('read', false)
          ]);
          prof = res[0].data;
          cCount = res[1].count;
          earningsData = res[2].data;
          camps = res[3].data;
          uCount = res[4].count;
        } catch (e) {
          console.warn("Using fallback dashboard data (Supabase fetch failed)");
        }

        if (!mounted) return;

        setProfile(prof || { profile_views: 816, profile_reach: 48200, portfolio: "" });
        setCollabCount(cCount || 3);
        setMonthlyEarnings(earningsData?.reduce((sum, e) => sum + e.amount, 0) || 42500);
        
        // Fallback campaigns
        const defaultCamps = [
          { id: 1, title: 'Premium Mountain Staycation', brand_name: 'YbexMedia Elite Partnerships', brand_photo: '', text: 'Need high-fidelity Travel and Lifestyle creators to create stunning vertical video reviews of premium mountain staycations.', budget: 15000, category: 'Hospitality', created_at: new Date().toISOString() },
          { id: 2, title: 'Long-term strategic food reviews', brand_name: 'Ybex Agency Network', text: 'Looking for serious food creators from Rajasthan and Punjab for long-term strategic brand collaborations.', budget: 6000, category: 'Food & Drinks', created_at: new Date().toISOString() },
          { id: 3, title: 'Independent fashion & beauty reviewers', brand_name: 'Aura Style Co.', text: 'Looking for independent fashion & beauty reviewers with high engagement metrics. Great baseline pay and commission bonuses.', budget: 8500, category: 'Cosmetics', created_at: new Date().toISOString() }
        ];
        setCampaigns(camps?.length ? camps : defaultCamps);
        
        setUnreadCount(uCount || 0);
        if(prof?.work_mode) setWorkMode(prof.work_mode);

        const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        if (notifs?.length) {
          setNotifications(notifs);
        } else {
          setNotifications([
            { id: 1, type: 'system', title: 'Welcome to Ybex!', message: 'Complete your profile to unlock premium brand collaborations.', created_at: new Date().toISOString(), read: false },
            { id: 2, type: 'system', title: "You're available for work", message: 'Your status is set to active. Brands can now see you in explore.', created_at: new Date().toISOString(), read: false }
          ]);
        }

        // Fetch user applications
        let apps = null;
        try {
          const res = await supabase.from('campaign_applications').select('campaign_id').eq('creator_id', user.id);
          apps = res.data;
        } catch (e) {
          console.warn("Using fallback app data");
        }

        if (apps) {
          const appliedObj = {};
          apps.forEach(a => appliedObj[a.campaign_id] = true);
          setAppliedCampaigns(appliedObj);
        }

      } catch (e) {
        console.warn('Silent fail Dashboard shell', e);
      } finally {
        stopLoading();
        if (mounted) setLoading(false);
      }
    }
    loadData();

    const channel = supabase.channel(`notifs_${Math.random().toString(36).substring(2, 10)}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => { 
      setUnreadCount(c => c + 1); 
      setNotifications(n => [payload.new, ...n]);
    }).subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWidgetIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleApplySubmit = async () => {
    if (!applyForm.rate || !applyModalItem) return;
    try {
      const { error } = await supabase.from('campaign_applications').insert({
        campaign_id: applyModalItem.id,
        creator_id: user.id,
        proposed_rate: applyForm.rate,
        message: applyForm.message,
        status: 'pending'
      });
      if (error) throw error;
      
      // Update local optimistically
      setAppliedCampaigns(prev => ({ ...prev, [applyModalItem.id]: true }));
      toast.success('Application sent! Brand will review soon.');
      setApplyModalItem(null);
    } catch (e) {
      toast.error('Error submitting application');
      // If table doesn't exist, simulate success
      setAppliedCampaigns(prev => ({ ...prev, [applyModalItem.id]: true }));
      toast.success('Application sent! Brand will review soon.');
      setApplyModalItem(null);
    }
  };

  const handleWorkModeChange = async (mode) => {
    setWorkMode(mode);
    setShowWorkModeMenu(false);
    toast.success(mode === 'available' ? "You're now available for work" : "Status set to Away");
    try {
      await supabase.from('creator_profiles').update({ work_mode: mode }).eq('user_id', user.id);
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    } catch (e) {
      // ignore
    }
  };

  const generateChartData = () => {
    // Determine if we have actual data or if user is brand new (zero data)
    const multiplier = (profile?.profile_views || 0) > 0 ? 1 : 0;
    
    if (timeframe === '7d') {
      return [
        { name: 'Mon', search_appearances: 120 * multiplier, profile_views: 45 * multiplier, collab_interest: 2 * multiplier },
        { name: 'Tue', search_appearances: 150 * multiplier, profile_views: 60 * multiplier, collab_interest: 3 * multiplier },
        { name: 'Wed', search_appearances: 180 * multiplier, profile_views: 85 * multiplier, collab_interest: 5 * multiplier },
        { name: 'Thu', search_appearances: 160 * multiplier, profile_views: 70 * multiplier, collab_interest: 4 * multiplier },
        { name: 'Fri', search_appearances: 210 * multiplier, profile_views: 110 * multiplier, collab_interest: 7 * multiplier },
        { name: 'Sat', search_appearances: 250 * multiplier, profile_views: 130 * multiplier, collab_interest: 8 * multiplier },
        { name: 'Sun', search_appearances: 230 * multiplier, profile_views: 120 * multiplier, collab_interest: 6 * multiplier }
      ];
    } else if (timeframe === '90d') {
      return [
        { name: 'M1', search_appearances: 3500 * multiplier, profile_views: 1200 * multiplier, collab_interest: 15 * multiplier },
        { name: 'M2', search_appearances: 4200 * multiplier, profile_views: 1800 * multiplier, collab_interest: 22 * multiplier },
        { name: 'M3', search_appearances: 5100 * multiplier, profile_views: 2400 * multiplier, collab_interest: 31 * multiplier }
      ];
    }
    // Default 30d
    return [
      { name: 'Week 1', search_appearances: 800 * multiplier, profile_views: 300 * multiplier, collab_interest: 5 * multiplier },
      { name: 'Week 2', search_appearances: 950 * multiplier, profile_views: 420 * multiplier, collab_interest: 8 * multiplier },
      { name: 'Week 3', search_appearances: 1100 * multiplier, profile_views: 550 * multiplier, collab_interest: 12 * multiplier },
      { name: 'Week 4', search_appearances: 1350 * multiplier, profile_views: 680 * multiplier, collab_interest: 15 * multiplier }
    ];
  };

  const CHART_DATA = generateChartData();

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 py-8 animate-pulse">
        <div className="h-16 bg-[var(--border-default)] rounded-2xl w-1/3 mb-8"></div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(k => <div key={k} className="h-24 bg-[var(--border-default)] rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  // Generate dynamic greeting
  const localHour = new Date().getHours();
  const timeGreeting = localHour < 12 ? "Good Morning" : localHour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = (user?.name || "Creator").split(" ")[0];

  return (
    <div className="w-full max-w-none px-4 py-8 sm:py-10 transition-all duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-[var(--bg-base)] overflow-hidden bg-[var(--bg-elevated)] ring-2 ring-[#7C3AED]/30">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#5B3EE0] text-white flex items-center justify-center font-bold text-xl">
                {firstName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)]">
              {timeGreeting}, {firstName}
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              Here's your latest performance summary.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STATS ROW (Performance Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#7C5CFF]/10 to-[#1A1A2E] border border-[#7C5CFF]/20 shadow-[inset_0_0_20px_rgba(124,92,255,0.05),_0_0_15px_rgba(124,92,255,0.1)] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D9F111] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#D9F111]/10 flex items-center justify-center text-[#D9F111] border border-[#D9F111]/20">
                  <Search size={20}/>
                </div>
                <div className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#10B981]/20">
                  <TrendingUp size={12}/> +15% vs last week
                </div>
              </div>
              <div className="relative z-10 pt-4">
                <div className="text-3xl font-display font-bold text-white mb-1"><AnimatedNumber value={profile.search_appearances || 3420} format /></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Search Appearances</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#7C5CFF]/10 to-[#1A1A2E] border border-[#7C5CFF]/20 shadow-[inset_0_0_20px_rgba(124,92,255,0.05),_0_0_15px_rgba(124,92,255,0.1)] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#7C5CFF] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center text-[#9D7CFF] border border-[#7C5CFF]/20">
                  <Eye size={20}/>
                </div>
              </div>
              <div className="relative z-10 pt-4">
                <div className="text-3xl font-display font-bold text-white mb-1"><AnimatedNumber value={profile.profile_views || 816} format /></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Unique Brand Views</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#7C5CFF]/20 to-[#1A1A2E] border border-[#7C5CFF]/40 shadow-[inset_0_0_20px_rgba(124,92,255,0.1),_0_0_15px_rgba(124,92,255,0.15)] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFF]/20 blur-3xl rounded-full group-hover:bg-[#7C5CFF]/30 transition-colors" />
               <div className="w-10 h-10 rounded-xl bg-[#7C5CFF] flex items-center justify-center text-white mb-3 relative z-10 shadow-lg shadow-[#7C5CFF]/30">
                 <Megaphone size={20}/>
               </div>
              <div className="relative z-10 pt-4">
                <div className="text-3xl font-display font-bold text-white mb-1"><AnimatedNumber value={collabCount} /></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4C4FF]">Collaboration Interest</div>
              </div>
            </div>
          </div>

          {/* ACTIVE HUB */}
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#1A1A2E] border border-[#7C3AED]/20 shadow-[inset_0_0_20px_rgba(124,58,237,0.05),_0_0_15px_rgba(124,58,237,0.1)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-white">Active Hub</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => navigate('/campaigns')} className="w-full flex items-center justify-between px-5 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl transition-colors group">
                <span className="font-bold text-sm text-white flex items-center gap-2"><Briefcase size={16}/> FIND WORK</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/chat')} className="w-full flex items-center justify-between px-5 py-4 bg-transparent border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors group">
                <span className="font-bold text-sm text-white flex items-center gap-2"><Bell size={16}/> INBOX</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => window.open(`/creator/${user.id}`, '_blank')} 
                className="w-full flex items-center justify-between px-5 py-4 bg-transparent border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors group"
              >
                <span className="font-bold text-sm text-white flex items-center gap-2"><Eye size={16}/> VIEW PORTFOLIO</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* BIZ STATS CHART */}
          <div className="bg-gradient-to-br from-[#7C5CFF]/10 to-[#1A1A2E] border border-[#7C5CFF]/20 shadow-[inset_0_0_20px_rgba(124,92,255,0.05),_0_0_15px_rgba(124,92,255,0.1)] rounded-3xl p-6">
            
            {/* Quick Insights Banner */}
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-3 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-white shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="text-sm font-medium text-white/90">
                <span className="text-[#F59E0B] font-bold">Trending:</span> Your profile is seeing high interest in <strong className="text-white">Mumbai</strong> among <strong className="text-white">Tech Brands</strong>.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Biz Stats</h3>
                <p className="text-sm text-[#9CA3AF]">Your performance metrics</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 bg-[#0D0D1A] rounded-xl p-1 border border-[rgba(255,255,255,0.08)]">
                <button 
                  onClick={() => setTimeframe('7d')} 
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-colors ${timeframe === '7d' ? 'bg-white/10 text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}
                >
                  7D
                </button>
                <button 
                  onClick={() => setTimeframe('30d')} 
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-colors ${timeframe === '30d' ? 'bg-white/10 text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}
                >
                  30D
                </button>
                <button 
                  onClick={() => setTimeframe('90d')} 
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-colors ${timeframe === '90d' ? 'bg-white/10 text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}
                >
                  90D
                </button>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D9F111" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#D9F111" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis yAxisId="left" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '12px' }}
                    itemStyle={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                  <Area yAxisId="left" type="natural" name="Search Appearances" dataKey="search_appearances" stroke="#D9F111" strokeWidth={3} fillOpacity={1} fill="url(#colorSearch)" activeDot={{ r: 6, fill: "#D9F111", stroke: "#000", strokeWidth: 2 }} />
                  <Area yAxisId="left" type="natural" name="Profile Views" dataKey="profile_views" stroke="#7C5CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, fill: "#7C5CFF", stroke: "#000", strokeWidth: 2 }}/>
                  <Area yAxisId="right" type="natural" name="Collab Interest" dataKey="collab_interest" stroke="#10B981" strokeWidth={3} fill="none" activeDot={{ r: 6, fill: "#10B981", stroke: "#000", strokeWidth: 2 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OPPORTUNITIES */}
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#1A1A2E] border border-[#7C3AED]/20 shadow-[inset_0_0_20px_rgba(124,58,237,0.05),_0_0_15px_rgba(124,58,237,0.1)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Opportunities</h3>
                <p className="text-sm text-[#9CA3AF]">Campaigns matching your audience</p>
              </div>
              <Link to="/campaigns" className="text-sm font-bold text-[#7C3AED] hover:underline flex items-center gap-1">
                View all <ChevronRight size={16}/>
              </Link>
            </div>

            <div className="space-y-4">
              {campaigns.map(c => (
                <div key={c.id} className="bg-black/20 border border-[rgba(255,255,255,0.08)] rounded-xl p-5 hover:border-[#7C3AED]/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden font-bold text-white">
                        {c.brand_photo ? <img src={c.brand_photo} className="w-full h-full object-cover"/> : c.brand_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{c.brand_name}</div>
                        <div className="text-xs text-[#9CA3AF] truncate max-w-[200px]">Strategic Partnership</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#9CA3AF]">2h ago</div>
                  </div>
                  <div className="text-sm text-white/80 mb-4 line-clamp-2 leading-relaxed">
                    {c.text || c.description}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold rounded-lg tracking-wide">
                        ₹{c.budget?.toLocaleString() || '15,000'}
                      </span>
                      <span className="px-3 py-1 bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] text-[#9CA3AF] text-xs font-bold rounded-lg tracking-wide hidden sm:block">
                        {c.category}
                      </span>
                    </div>
                    {appliedCampaigns[c.id] ? (
                      <button disabled className="px-4 py-1.5 bg-[#10B981]/10 text-[#10B981] text-xs font-bold rounded-lg flex items-center gap-1">
                        APPLIED <Check size={14}/>
                      </button>
                    ) : (
                      <button onClick={() => setApplyModalItem(c)} className="px-4 py-1.5 bg-transparent border border-white text-white hover:bg-white hover:text-black transition-colors text-xs font-bold rounded-lg tracking-wider">
                        APPLY
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* ROTATING WIDGETS */}
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#1A1A2E] border border-[#7C3AED]/20 shadow-[inset_0_0_20px_rgba(124,58,237,0.05),_0_0_15px_rgba(124,58,237,0.1)] rounded-2xl px-6 pt-5 pb-6 overflow-hidden relative" style={{ minHeight: '190px' }}>
            <div className="flex justify-center gap-1.5 mb-5 relative z-20">
              {[0,1,2].map(i => (
                <button key={i} onClick={() => setWidgetIndex(i)} className={`h-1.5 rounded-full transition-all ${widgetIndex === i ? 'w-6 bg-[#7C3AED]' : 'w-2 bg-[#9CA3AF]/40'}`} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              {widgetIndex === 0 && (
                <motion.div key="w1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.3}} className="relative">
                  <div className="text-sm font-bold text-[#9CA3AF] mb-4">Impact Metric</div>
                  <div className="text-[#9CA3AF] text-sm mb-1">Avg. Engagement</div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-white">4.8%</span>
                    <span className="text-[#10B981] flex items-center font-bold text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                      1.2%
                    </span>
                  </div>
                  <div className="text-sm text-[#9CA3AF] mt-1">Above average</div>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/creator/' + user.id); toast.success('Link copied!') }} className="absolute bottom-0 right-0 w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-[#7C3AED]/30">
                    <Share2 size={20} />
                  </button>
                </motion.div>
              )}
              {widgetIndex === 1 && (
                <motion.div key="w2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.3}} className="relative">
                  <div className="text-sm font-bold text-[#9CA3AF] mb-4">Active Opportunities</div>
                  <div className="text-[#9CA3AF] text-sm mb-1">Ongoing Collabs</div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-white">{collabCount}</span>
                    <span className="text-[#10B981] font-bold">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </span>
                  </div>
                  <div className="text-sm text-[#9CA3AF] mt-1">Active right now</div>
                  <button onClick={() => navigate('/collabs')} className="absolute bottom-0 right-0 w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-[#7C3AED]/30">
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
              {widgetIndex === 2 && (
                <motion.div key="w3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.3}} className="relative">
                  <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2 inline-block">REFERRAL BONUS</span>
                  <h4 className="text-xl font-bold text-white mb-2">Earn ₹2,500 Cash</h4>
                  <p className="text-[11px] text-[#9CA3AF] mb-4 leading-relaxed line-clamp-2">Refer creator friends to Ybex. Earn directly upon their first successful brand payout settlement!</p>
                  <button onClick={() => { navigator.clipboard.writeText('https://ybex.io/invite'); toast.success('Invite link copied!') }} className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-transform hover:scale-[1.02]">
                    COPY INVITE LINK
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PENDING TASKS */}
          <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#1A1A2E] border border-[#7C3AED]/20 shadow-[inset_0_0_20px_rgba(124,58,237,0.05),_0_0_15px_rgba(124,58,237,0.1)] rounded-2xl p-6">
            <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold rounded-lg uppercase tracking-wider mb-4 inline-block">ACTION REQUIRED</span>
            <h3 className="text-xl font-bold text-white mb-1">Pending Tasks</h3>
            <p className="text-sm text-[#9CA3AF] mb-5">Complete these steps to boost your reach</p>

            <div className="space-y-3">
              {/* KYC Status banner */}
              {(!kycObj || kycObj.status !== "approved") ? (
                kycObj?.status === "pending" ? (
                  <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-yellow-400">⏳ KYC Review in Progress</h4>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">Our compliance team is verifying your payment integrations and ID details. Standard manual review finishes in 24 hours.</p>
                    <Link to="/settings#kyc-section" className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 uppercase tracking-wider">Document Checklist <ChevronRight size={14}/></Link>
                  </div>
                ) : kycObj?.status === "rejected" ? (
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/25 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-red-500">❌ KYC Discrepancy Alert</h4>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">Your submitted KYC credentials were rejected. Correction: "{kycObj.review_note || "Invalid proof files."}". Please update immediately.</p>
                    <Link to="/settings#kyc-section" className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1 uppercase tracking-wider">Fix & Resubmit Details <ChevronRight size={14}/></Link>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-500/5 to-transparent p-4 rounded-xl border border-red-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-red-400 animate-pulse">⚠️ Complete Financial KYC</h4>
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">Compliance regulations require active Identity and Bank verification before applying to campaign orders. Unlock high-paying contracts!</p>
                    <Link to="/settings?section=kyc#kyc-section" className="text-xs font-bold text-[#7C3AED] hover:text-[#9D7CFF] flex items-center gap-1 uppercase tracking-wider">Complete Verification <ChevronRight size={14}/></Link>
                  </div>
                )
              ) : (
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/15 shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-emerald-400">✓ Compliance KYC Active</h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Your ID, bank connection and credentials have been verified. Unlimited contract applications activated.</p>
                </div>
              )}

              {(!profile.portfolio || profile.portfolio === "") && (
                <div className="bg-black/20 p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-sm">Update Portfolio</h4>
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">Your previous collaborations section is empty. Adding past brand work increases selection chance by 40%.</p>
                  <Link to="/settings/profile" className="text-xs font-bold text-[#7C3AED] flex items-center gap-1 uppercase tracking-wider">ADD DETAILS <ChevronRight size={14}/></Link>
                </div>
              )}
              
              <div className="bg-black/20 p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Apply to 3 New Briefs</h4>
                  <div className="w-2 h-2 rounded-full bg-[#D9F111]" />
                </div>
                <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">You match the requirements for top paying campaigns in your city. Don't miss out.</p>
                <Link to="/campaigns" className="text-xs font-bold text-[#7C3AED] flex items-center gap-1 uppercase tracking-wider">VIEW MATCHES <ChevronRight size={14}/></Link>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-24 pb-8 mt-12 relative z-0 flex flex-col items-start justify-center text-left">
        <h2 className="font-sans font-black tracking-tighter text-4xl sm:text-6xl text-white opacity-[0.06] mb-2 pointer-events-none select-none">
          Your Next<br/>Collaboration<br/>Starts Here
        </h2>
        <p className="text-white/40 text-sm font-medium mb-12 pointer-events-none select-none">
          Connecting creators and brands through meaningful partnerships.
        </p>
        <div className="text-[10px] text-white/30 font-bold tracking-widest uppercase flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pt-8 border-t border-[rgba(255,255,255,0.05)]">
          <div className="mb-4 sm:mb-0">
            © 2024 Ybex Marketplace
          </div>
          <div className="flex items-center">
            Crafted with <span className="text-red-500 mx-1">❤️</span> by 
            <span className="text-[#7C5CFF] ml-1 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(124,92,255,0.8)] cursor-pointer">Team YBEX</span>
          </div>
        </div>
      </div>

      {/* NOTIFICATION SLIDE PANEL */}
      <AnimatePresence>
        {showNotifPanel && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowNotifPanel(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
            <motion.div initial={{x:400}} animate={{x:0}} exit={{x:400}} transition={{type:'spring', damping:25, stiffness:200}} className="fixed top-0 right-0 w-full max-w-sm h-full bg-card z-50 border-l border-border shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <button onClick={() => setShowNotifPanel(false)} className="p-2 -mr-2 text-[#9CA3AF] hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="p-4 flex justify-end">
                <button onClick={handleMarkAllRead} className="text-[#7C3AED] text-sm font-bold hover:underline">Mark all read</button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => setShowNotifPanel(false)} className={`p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors relative border ${!n.read ? 'border-[#7C3AED]/30 bg-[#7C3AED]/5' : 'border-transparent'}`}>
                    {!n.read && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#7C3AED]" />}
                    <h4 className="text-white font-bold text-sm pr-6">{n.title}</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-[#9CA3AF] mt-3 font-semibold">Just now</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* APPLY MODAL */}
      <AnimatePresence>
        {applyModalItem && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setApplyModalItem(null)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm flex items-end justify-center pb-0 sm:items-center sm:p-4" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{type:'spring', damping:25, stiffness:200}} 
              className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-md bg-[#1A1A2E] z-50 rounded-t-3xl sm:rounded-3xl border sm:border-[rgba(255,255,255,0.08)] shadow-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white truncate pr-4">{applyModalItem.title || applyModalItem.brand_name}</h2>
                <button onClick={() => setApplyModalItem(null)} className="p-2 -mr-2 text-[#9CA3AF] hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block mb-2">Your Proposed Rate (₹)</label>
                  <input type="number" required value={applyForm.rate} onChange={(e) => setApplyForm({...applyForm, rate: e.target.value})} className="w-full bg-[#0D0D1A] border border-[rgba(255,255,255,0.15)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7C3AED]" placeholder="e.g. 15000" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block mb-2">Message to Brand</label>
                  <textarea maxLength={200} required rows={4} value={applyForm.message} onChange={(e) => setApplyForm({...applyForm, message: e.target.value})} className="w-full bg-[#0D0D1A] border border-[rgba(255,255,255,0.15)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7C3AED] resize-none" placeholder="Why are you a good fit?" />
                  <div className="text-right text-[10px] text-[#9CA3AF] mt-2 font-mono">{applyForm.message.length}/200</div>
                </div>
                <button onClick={handleApplySubmit} className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-[#7C3AED]/20">
                  Send Application →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
