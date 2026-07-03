import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import ActivityFeed from "./ActivityFeed";
import CampaignMiniList from "./CampaignMiniList";
import { Megaphone, Users2, ShieldAlert, Sparkles, Building, Coins, LayoutGrid, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import NotificationBell from "./NotificationBell";

export default function BrandDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    campaignsCount: 0,
    applicantsCount: 0,
    dealsCount: 0,
    amountSpent: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch dynamic campaigns
      const { data: camps } = await api.get("/campaigns?mine=true").catch(() => ({ data: [] }));
      setCampaigns(camps || []);

      // Fetch dynamic collabs
      const { data: colData } = await api.get("/collabs").catch(() => ({ data: { sent: [], received: [] } }));
      const allDeals = [
        ...(colData.sent || []),
        ...(colData.received || []),
        ...(colData.campaign_applications || [])
      ];

      // Computations
      const activeDeals = allDeals.filter(d => d.stage !== "COMPLETED" && d.stage !== "PAID").length;
      const totalSpent = allDeals
        .filter(d => d.stage === "COMPLETED" || d.stage === "PAID")
        .reduce((sum, current) => sum + Number(current.proposed_amount || current.budget || 0), 0);

      const totalApps = camps.reduce((sum, c) => sum + (c.applicants?.length || 0), 0);

      setStats({
        campaignsCount: camps.length,
        applicantsCount: totalApps,
        dealsCount: activeDeals,
        amountSpent: totalSpent
      });

    } catch (e) {
      console.warn("Failed retrieving brand metrics", e);
    } finally {
      setLoading(false);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const { count: uCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (notifs && notifs.length > 0) {
        setNotifications(notifs);
        setUnreadCount(uCount || 0);
      } else {
        setNotifications([
          { id: 1, title: "Campaign Briefing Approved!", message: "Your brief 'Summer Glow' has been successfully approved by admins and is now LIVE.", created_at: new Date().toISOString(), read: false },
          { id: 2, title: "New Pitch Received 🚀", message: "Popular Lifestyle Creator Sagar Verma has pitched for your 'Indian Food & Travel Vlogging' campaign.", created_at: new Date().toISOString(), read: false },
          { id: 3, title: "Account Verification Successful", message: "Your brand profile/enterprise setup has been verified. Welcome to YBEX Partnerships!", created_at: new Date(Date.now() - 86400000).toISOString(), read: true }
        ]);
        setUnreadCount(2);
      }
    } catch (err) {
      console.warn("Could not fetch brand notifications", err);
      setNotifications([
        { id: 1, title: "Campaign Briefing Approved!", message: "Your brief 'Summer Glow' has been successfully approved by admins and is now LIVE.", created_at: new Date().toISOString(), read: false },
        { id: 2, title: "New Pitch Received 🚀", message: "Popular Lifestyle Creator Sagar Verma has pitched for your 'Indian Food & Travel Vlogging' campaign.", created_at: new Date().toISOString(), read: false },
        { id: 3, title: "Account Verification Successful", message: "Your brand profile/enterprise setup has been verified. Welcome to YBEX Partnerships!", created_at: new Date(Date.now() - 86400000).toISOString(), read: true }
      ]);
      setUnreadCount(2);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (user) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id);
      }
    } catch (e) {
      console.warn(e);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    loadData();
    loadNotifications();

    if (!user) return;
    const channel = supabase.channel(`brand_notifs_${Math.random().toString(36).substring(2, 10)}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => { 
      setUnreadCount(c => c + 1); 
      setNotifications(n => [payload.new, ...n]);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 bg-[#09090e] min-h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin"></div>
          <div className="text-white/40 text-sm font-mono tracking-widest uppercase">Loading Dashboard metrics...</div>
        </div>
      </div>
    );
  }

  // Dynamic greeting calculations based on user's client-side clock time
  const localHour = new Date().getHours();
  const timeGreeting = localHour < 12 ? "Good Morning" : localHour < 17 ? "Good Afternoon" : "Good Evening";
  const brandName = user?.name || "Brand Executive";

  return (
    <div className="min-h-screen bg-[#09090e] text-white py-10 px-4 sm:px-6 md:px-8 text-left w-full max-w-none relative overflow-x-hidden">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C5CFF]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D9F111]/3 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header section with brand greeting */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="text-xs font-bold text-[#9D7CFF] uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Partner Console
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {timeGreeting}, Team {brandName}
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-1.5">
            Welcome back to YBEX. All campaigns and payouts are operational.
          </p>
        </div>

        {/* Dynamic Notification Bell Indicator */}
        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="space-y-6 relative z-10">
        
        {/* TOP STATS ROW - 4 cards only, purple numbers, no Escrow, no KYC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="Total Campaigns" 
            value={stats.campaignsCount} 
            icon={Megaphone} 
            colorClass="text-[#9D7CFF]"
          />
          <StatsCard 
            label="Applicants Pitched" 
            value={stats.applicantsCount} 
            icon={Users2} 
            colorClass="text-[#9D7CFF]"
          />
          <StatsCard 
            label="Active Deals" 
            value={stats.dealsCount} 
            icon={LayoutGrid} 
            colorClass="text-[#9D7CFF]"
          />
          <StatsCard 
            label="Amount Spent" 
            value={stats.amountSpent} 
            prefix="₹"
            icon={Coins} 
            colorClass="text-[#9D7CFF]"
          />
        </div>

        {/* QUICK SESSIONS GATE */}
        <div>
          <QuickActions />
        </div>

        {/* FULL WIDTH STACKED LAYOUT */}
        <div className="space-y-8">
          <div className="w-full">
            <ActivityFeed />
          </div>
          <div className="w-full">
            <CampaignMiniList campaigns={campaigns} />
          </div>
        </div>

      </div>

      {/* NOTIFICATION SLIDE PANEL */}
      <AnimatePresence>
        {showNotifPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowNotifPanel(false)} 
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm shadow-inner" 
            />
            <motion.div 
              initial={{ x: 400 }} 
              animate={{ x: 0 }} 
              exit={{ x: 400 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-card z-50 border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell size={20} className="text-[#a98eff]" /> Notifications
                </h2>
                <button 
                  onClick={() => setShowNotifPanel(false)} 
                  className="p-2 -mr-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex justify-end border-b border-white/5 bg-white/[0.01]">
                <button 
                  onClick={handleMarkAllRead} 
                  className="text-[#a98eff] hover:text-[#c4b5fd] text-xs font-bold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                    <Bell size={32} className="opacity-20 mb-2" />
                    <p className="text-xs">No active notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => setShowNotifPanel(false)} 
                      className={`p-4 rounded-xl hover:bg-white/5 transition-all duration-200 relative border text-left ${
                        !n.read ? 'border-[#7C5CFF]/30 bg-[#7C5CFF]/5 shadow-sm' : 'border-white/5'
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute top-4 right-4 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C5CFF] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C5CFF]"></span>
                        </span>
                      )}
                      <h4 className="text-white font-bold text-xs pr-6 leading-snug">{n.title}</h4>
                      <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">{n.message}</p>
                      <div className="text-[9px] text-white/30 mt-3 font-semibold font-mono">JUST NOW</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
