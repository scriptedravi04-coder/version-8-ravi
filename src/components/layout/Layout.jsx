import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { Bell, LogOut, Settings as SettingsIcon, Menu, X, ShieldAlert, User, Film, Sun, Moon, LayoutGrid, Megaphone, FileText, Wallet, Briefcase, MessageCircle, Info, Users, Search, AlertTriangle, Cloud, ChevronRight, ChevronLeft, ArrowLeftRight, Link as LinkIcon, Compass, ChevronDown, Gift, Banknote, ArrowRight } from "lucide-react";
import YbexLogo from "./YbexLogo";
import NotificationBell from "../shared/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [workMode, setWorkMode] = useState("ready");
  const dropdownRef = useRef(null);

  const [sidebarPosition, setSidebarPosition] = useState(() => {
    return localStorage.getItem("sidebar_position") || "left";
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebar_open") !== "false";
  });

  const toggleSidebarPosition = () => {
    const nextPos = sidebarPosition === "left" ? "right" : "left";
    setSidebarPosition(nextPos);
    localStorage.setItem("sidebar_position", nextPos);
    toast.success(`Sidebar moved to the ${nextPos === 'left' ? 'left' : 'right'} side! ↔️`);
  };

  const toggleSidebarOpen = () => {
    const nextOpen = !sidebarOpen;
    setSidebarOpen(nextOpen);
    localStorage.setItem("sidebar_open", String(nextOpen));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Handle click outside to close avatar menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    await logout();
    // Do not use React Router navigate here because modifying the user state
    // will trigger ProtectedRoute's <Navigate> to bounce the user automatically.
    // If on an unprotected route, they just stay logged out.
    // To be perfectly safe against DOM caching issues on logout, a hard reload is best:
    window.location.href = "/login";
  };

  const toggleWorkMode = async () => {
    const nextMode = workMode === "ready" ? "away" : "ready";
    setWorkMode(nextMode);
    toast.info(`Work mode status set to ${nextMode.toUpperCase()}`, {
      icon: "💼",
      description: nextMode === "ready" ? "You are now active and open to campaign pitches." : "You are marked as away/rest mode."
    });
    try {
      await supabase.from('creator_profiles').update({ work_mode: nextMode === "ready" ? "available" : "away" }).eq('user_id', user.user_id);
    } catch(e) {}
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/onboarding";
  const useSidebar = user && !isAuthPage && location.pathname !== "/";

  const SidebarNavItemInner = ({ to, icon, children, testId }) => {
    let isExactMatch = location.pathname + location.search === to;
    if (to === "/admin?tab=dashboard" && location.pathname === "/admin" && !location.search) {
       isExactMatch = true;
    } else if (!to.includes("?") && location.pathname === to) {
       isExactMatch = true;
    }
    return (
      <Link 
        to={to} 
        data-testid={testId} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${isExactMatch ? "text-[#7C5CFF] bg-[#7C5CFF]/10 shadow-[inner_0_1px_5px_rgba(124,92,255,0.1)] border border-[#7C5CFF]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"}`}
      >
        {icon}
        {children}
      </Link>
    );
  };

  if (useSidebar) {
    if (user?.role === 'creator') {
      const isExactMatch = (path) => location.pathname === path;
      return (
        <div className={`flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-hidden ${sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
          
          {/* Main Sidebar */}
          {sidebarOpen && (
            <aside className={`w-[260px] flex-shrink-0 bg-[var(--bg-card)] hidden md:flex flex-col z-10 border-[var(--border-default)] ${sidebarPosition === 'left' ? 'border-r shadow-[2px_0_10px_rgba(0,0,0,0.02)]' : 'border-l shadow-[-2px_0_10px_rgba(0,0,0,0.02)]'}`}>
              <div className="p-8 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to="/dashboard">
                    <YbexLogo className="h-auto" />
                  </Link>
                </div>
                
                {/* Sidebar layout controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={toggleSidebarPosition}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    title={sidebarPosition === 'left' ? "Move Sidebar to Right" : "Move Sidebar to Left"}
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                  <button
                    onClick={toggleSidebarOpen}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    title="Close Sidebar"
                  >
                    {sidebarPosition === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
              <Link to="/dashboard" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/dashboard') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <LayoutGrid size={20} className={isExactMatch('/dashboard') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Dashboard
              </Link>
              
              <Link to="/campaigns" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${location.pathname.includes('/campaigns') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}><Compass size={20} className={location.pathname.includes("/campaigns") ? "text-[var(--violet)]" : "text-[var(--text-tertiary)]"} /> Live Campaigns
              </Link>
              
              <Link to="/collabs" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/collabs') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <FileText size={20} className={isExactMatch('/collabs') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Applications
              </Link>
              
              <Link to="/creator/ugc/orders" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/creator/ugc/orders') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <ShieldAlert size={20} className={isExactMatch('/creator/ugc/orders') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> My Deals
              </Link>
              
              <Link to="/chat" className={`text-sm py-3 px-4 rounded-xl flex items-center justify-between transition-all ${isExactMatch('/chat') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <div className="flex items-center gap-4">
                  <MessageCircle size={20} className={isExactMatch('/chat') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Inbox
                </div>
                <div className="bg-[var(--violet)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">6</div>
              </Link>

              <Link to="/earnings" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/earnings') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <Wallet size={20} className={isExactMatch('/earnings') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Earnings
              </Link>

              <div className="py-4"><div className="h-px bg-[var(--bg-elevated)] w-full mx-auto"></div></div>

              <Link to="/profile/overview" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${location.pathname.includes('/profile') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <User size={20} className={location.pathname.includes('/profile') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> My Profile
              </Link>

              <Link to="/refer" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/refer') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <Gift size={20} className={isExactMatch('/refer') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Refer & Earn
              </Link>
              
              <Link to="/settings" className={`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all ${isExactMatch('/settings') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-medium'}`}>
                <SettingsIcon size={20} className={isExactMatch('/settings') ? 'text-[var(--violet)]' : 'text-[var(--text-tertiary)]'} /> Settings
              </Link>
            </div>

            <div className="p-6 mt-auto bg-[var(--bg-card)] border-t border-[var(--border-default)]">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${workMode === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`}></div>
                  Available for Work
                </span>
                <button 
                  onClick={() => setWorkMode(workMode === 'ready' ? 'busy' : 'ready')} 
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${workMode === 'ready' ? 'bg-[var(--violet)]' : 'bg-[var(--border-strong)]'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-[var(--bg-card)] transition-transform ${workMode === 'ready' ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--violet)] to-[#A78BFA] p-[2px]">
                   <img src={user?.avatar || "https://i.pravatar.cc/150?u=ravi"} alt={user?.name || "Ravi Sharma"} className="w-full h-full rounded-full border-2 border-[var(--bg-card)] object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name || "Ravi Sharma"}</h4>
                  <p className="text-xs text-[var(--text-secondary)] truncate font-medium">{user?.role || "Creator"}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-3 px-2">
                <Link to="/profile/overview" className="text-xs font-semibold text-[var(--violet)] hover:text-[#A78BFA] flex items-center gap-1.5 transition-colors">
                  View Public Profile <ArrowRight size={14} />
                </Link>
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors bg-rose-500/5 hover:bg-rose-500/10 px-2 py-1.5 rounded-lg border border-rose-500/10 hover:border-rose-500/20 w-full justify-center"
                >
                  <LogOut size={13} /> Log Out
                </button>
              </div>
            </div>
          </aside>
          )}

          {!sidebarOpen && (
            <button
              onClick={toggleSidebarOpen}
              className={`fixed top-24 z-40 py-3 px-4 bg-gradient-to-r from-[var(--violet)] to-indigo-600 hover:from-indigo-600 hover:to-[var(--violet)] text-white shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-white/10 cursor-pointer ${sidebarPosition === 'left' ? 'left-0 rounded-r-2xl border-l-0' : 'right-0 rounded-l-2xl border-r-0'}`}
              title="Open Sidebar"
            >
              {sidebarPosition === 'left' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Sidebar</span>
            </button>
          )}

          {/* Mobile Header for Creator */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-card)] border-b border-[var(--border-default)] z-50 flex items-center justify-between px-4 shadow-sm">
            <Link to="/dashboard"><YbexLogo className="h-auto" /></Link>
            <div className="flex items-center gap-2">
               <NotificationBell />
               <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[var(--text-secondary)]">
                 {menuOpen ? <X size={20}/> : <Menu size={20}/>}
               </button>
            </div>
          </div>

          {/* Mobile Menu for Creator */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-14 left-0 right-0 z-40 md:hidden bg-[var(--bg-card)] border-b border-[var(--border-default)] shadow-xl p-4 flex flex-col gap-2 overflow-y-auto max-h-[80vh]"
              >
                <Link to="/dashboard" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><LayoutGrid size={18} />Dashboard</Link>
                <Link to="/campaigns" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Compass size={20} className={location.pathname.includes("/campaigns") ? "text-[var(--violet)]" : "text-[var(--text-tertiary)]"} /> Live Campaigns</Link>
                <Link to="/collabs" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><FileText size={18} />Applications</Link>
                <Link to="/creator/ugc/orders" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><ShieldAlert size={18} />My Deals</Link>
                <Link to="/chat" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} />Inbox
                  </div>
                  <div className="bg-[var(--violet)] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">6</div>
                </Link>
                <Link to="/earnings" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Wallet size={18} />Earnings</Link>
                <Link to="/profile/overview" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><User size={18} />My Profile</Link>
                <Link to="/refer" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Gift size={18} />Refer & Earn</Link>
                <Link to="/settings" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><SettingsIcon size={18} />Settings</Link>
                
                <div className="h-px bg-[var(--border-default)] my-2" />
                
                <button onClick={toggleWorkMode} className="px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)]/50 text-[var(--text-primary)] font-semibold text-left flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className={workMode === "ready" ? "text-emerald-500 animate-bounce" : "text-amber-500"} />
                    <span className={workMode === "ready" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                      {workMode === "ready" ? "Available for Work" : "Away"}
                    </span>
                  </div>
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${workMode === "ready" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${workMode === "ready" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                  </span>
                </button>
                
                <button onClick={onLogout} className="px-4 py-3 rounded-xl text-rose-500 font-bold text-left flex items-center gap-3 hover:bg-rose-500/5 transition-colors"><LogOut size={18} />Log Out</button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
             <main className="flex-1 flex flex-col pt-14 md:pt-0 min-h-full">
                {children}
             </main>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative transition-colors duration-200 overflow-hidden ${sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
         {/* Desktop Sidebar */}
         {sidebarOpen && (
           <aside className={`w-[260px] flex-shrink-0 bg-[var(--bg-card)] hidden md:flex flex-col border-[var(--border-default)] ${sidebarPosition === 'left' ? 'border-r' : 'border-l'}`}>
              <div className="p-6 pb-2 mb-2 flex items-center justify-between">
                <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className="flex flex-col gap-1">
                  <YbexLogo className="h-auto" />
                </Link>
                
                {/* Sidebar layout controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={toggleSidebarPosition}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    title={sidebarPosition === 'left' ? "Move Sidebar to Right" : "Move Sidebar to Left"}
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                  <button
                    onClick={toggleSidebarOpen}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    title="Close Sidebar"
                  >
                    {sidebarPosition === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            
            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
               {user?.role === 'admin' ? (
                 <>
                   <SidebarNavItemInner to="/admin?tab=dashboard" icon={<LayoutGrid size={18} />}>Overview</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=users" icon={<Users size={18} />}>Users & Creators</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=waitlist" icon={<FileText size={18} />}>Waitlist</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=verifications" icon={<ShieldAlert size={18} />}>KYC Checks</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=campaigns" icon={<Megaphone size={18} />}>Approve Campaigns</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=chat" icon={<MessageCircle size={18} />}>Chat Moderation</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=reports" icon={<AlertTriangle size={18} />}>System Reports</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=escrow" icon={<Wallet size={18} />}>Escrow & Payables</SidebarNavItemInner>
                   <SidebarNavItemInner to="/admin?tab=ugc-orders" icon={<Film size={18} />}>UGC Orders <span className="text-red-400 font-bold ml-auto text-[10px] animate-pulse">AT RISK</span></SidebarNavItemInner>
                   <div className="pt-6 pb-2"><div className="h-px bg-[var(--border-default)] w-full"></div></div>
                   <SidebarNavItemInner to="/admin?tab=settings" icon={<SettingsIcon size={18} />}>Platform Settings</SidebarNavItemInner>
                 </>
               ) : user?.role === 'brand' ? (
                 <>
                   <SidebarNavItemInner to="/dashboard" icon={<LayoutGrid size={18} />}>Dashboard</SidebarNavItemInner>
                   <SidebarNavItemInner to="/creators" icon={<Search size={18} />}>Explore Creators</SidebarNavItemInner>
                   <SidebarNavItemInner to="/brand/campaigns" icon={<Megaphone size={18} />}>My Campaigns</SidebarNavItemInner>
                   <SidebarNavItemInner to="/brand/inbox" icon={<MessageCircle size={18} />}>Inbox</SidebarNavItemInner>
                   <SidebarNavItemInner to="/brand/payments" icon={<Wallet size={18} />}>Payments & Escrow</SidebarNavItemInner>
                   <div className="pt-6 pb-2"><div className="h-px bg-[var(--border-default)] w-full"></div></div>
                   <div className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">🎬 UGC</div>
                   <SidebarNavItemInner to="/brand/ugc/briefs" icon={<FileText size={18} />}>My Briefs</SidebarNavItemInner>
                   {/*Removed*/}
                   <SidebarNavItemInner to="/brand/ugc/orders" icon={<LayoutGrid size={18} />}>Orders & Tracking</SidebarNavItemInner>
                   <div className="pt-6 pb-2"><div className="h-px bg-[var(--border-default)] w-full"></div></div>
                   <SidebarNavItemInner to="/settings" icon={<SettingsIcon size={18} />}>Settings</SidebarNavItemInner>
                 </>
               ) : (
                 <>
                   <SidebarNavItemInner to="/dashboard" icon={<LayoutGrid size={18} />}>Dashboard</SidebarNavItemInner>
                   <SidebarNavItemInner to="/campaigns" icon={<Megaphone size={18} />}>Live Campaigns</SidebarNavItemInner>
                   <SidebarNavItemInner to="/collabs" icon={<FileText size={18} />}>My Applications</SidebarNavItemInner>
                   <SidebarNavItemInner to="/chat" icon={<MessageCircle size={18} />}>Inbox</SidebarNavItemInner>
                   <SidebarNavItemInner to="/earnings" icon={<Wallet size={18} />}>Earnings</SidebarNavItemInner>
                   <div className="pt-6 pb-2"><div className="h-px bg-[var(--border-default)] w-full"></div></div>
                   <div className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">🎬 UGC</div>
                   <SidebarNavItemInner to="/creator/ugc/browse" icon={<Search size={18} />}>Browse Briefs</SidebarNavItemInner>
                   <SidebarNavItemInner to="/creator/ugc/orders" icon={<FileText size={18} />}>My Orders</SidebarNavItemInner>
                   <div className="pt-6 pb-2"><div className="h-px bg-[var(--border-default)] w-full"></div></div>
                   <SidebarNavItemInner to="/settings" icon={<SettingsIcon size={18} />}>Settings</SidebarNavItemInner>
                 </>
               )}
            </div>

            <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-card)]">
               {user && (
                 <>
                   <button 
                     onClick={toggleWorkMode}
                     className="w-full flex items-center justify-between gap-2 px-3 py-2 mb-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--violet-border)] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm focus:outline-none"
                   >
                     <div className="flex items-center gap-2">
                       <Briefcase size={14} className={workMode === "ready" ? "text-emerald-500 animate-bounce" : "text-amber-500"} />
                       <span className="text-[var(--text-secondary)]">Status:</span>
                       <span className={workMode === "ready" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                         {workMode === "ready" ? "Available for Work" : "Away"}
                       </span>
                     </div>
                     <span className="relative flex h-2 w-2 ml-1">
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${workMode === "ready" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                       <span className={`relative inline-flex rounded-full h-2 w-2 ${workMode === "ready" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                     </span>
                   </button>

                   <div className="flex items-center gap-3 p-2 mb-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] shadow-sm">
                     {user.picture ? (
                        <img src={user.picture} alt="" className="w-10 h-10 rounded-lg object-cover shadow-sm"/>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center font-bold text-[var(--text-primary)] shadow-md">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-[var(--text-primary)]">{user.name}</div>
                        <Link to="/settings" className="text-[11px] text-[var(--text-secondary)] hover:text-[#7C5CFF] font-medium transition-colors">View Profile</Link>
                      </div>
                   </div>
                 </>
               )}

               <div className="flex items-center justify-between px-1 mt-3 mb-1 text-[var(--text-secondary)]">
                 
                 <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-2 rounded-lg text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
                  >
                    <LogOut size={14}/> Log Out
                  </button>
               </div>
            </div>
         </aside>

         )}

          {!sidebarOpen && (
            <button
              onClick={toggleSidebarOpen}
              className={`fixed top-24 z-40 py-3 px-4 bg-gradient-to-r from-[var(--violet)] to-indigo-600 hover:from-indigo-600 hover:to-[var(--violet)] text-white shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-white/10 cursor-pointer ${sidebarPosition === 'left' ? "left-0 rounded-r-2xl border-l-0" : "right-0 rounded-l-2xl border-r-0"}`}
              title="Open Sidebar"
            >
              {sidebarPosition === 'left' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Sidebar</span>
            </button>
          )}

          {/* Mobile Header for Sidebar Layout */}
         <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-card)] border-b border-[var(--border-default)] z-50 flex items-center justify-between px-4 shadow-sm">
            <Link to="/dashboard"><YbexLogo className="h-auto" /></Link>
            <div className="flex items-center gap-2">
               <NotificationBell />
               
               <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-[var(--text-secondary)]">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
            </div>
         </div>

         {/* Mobile Menu for Sidebar Layout */}
         <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-14 left-0 right-0 z-40 md:hidden bg-[var(--bg-card)] border-b border-[var(--border-default)] shadow-xl p-4 flex flex-col gap-2 overflow-y-auto max-h-[80vh]"
              >
                {user?.role === 'admin' ? (
                  <>
                    <Link to="/admin?tab=dashboard" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><LayoutGrid size={18} />Overview</Link>
                    <Link to="/admin?tab=users" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Users size={18} />Users & Creators</Link>
                    <Link to="/admin?tab=verifications" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><ShieldAlert size={18} />KYC Checks</Link>
                    <Link to="/admin?tab=campaigns" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Megaphone size={18} />Approve Campaigns</Link>
                    <Link to="/admin?tab=escrow" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Wallet size={18} />Escrow & Payables</Link>
                  </>
                ) : user?.role === 'brand' ? (
                  <>
                    <Link to="/dashboard" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><LayoutGrid size={18} />Dashboard</Link>
                    <Link to="/creators" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Search size={18} />Explore Creators</Link>
                    <Link to="/brand/campaigns" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Megaphone size={18} />My Campaigns</Link>
                    <Link to="/brand/inbox" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><MessageCircle size={18} />Inbox</Link>
                    <Link to="/brand/payments" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Wallet size={18} />Payments & Escrow</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><LayoutGrid size={18} />Dashboard</Link>
                    <Link to="/campaigns" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Megaphone size={18} />Live Campaigns</Link>
                    <Link to="/collabs" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><FileText size={18} />My Applications</Link>
                  </>
                )}
                
                <Link to="/earnings" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><Wallet size={18} />Earnings</Link>
                <div className="h-px bg-[var(--border-default)] my-2" />
                <Link to="/settings" className="px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold flex items-center gap-3"><SettingsIcon size={18} />Settings</Link>
                <div className="h-px bg-[var(--border-default)] my-2" />
                {user?.role === 'creator' && (
                  <button onClick={toggleWorkMode} className="px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)]/50 text-[var(--text-primary)] font-semibold text-left flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} className={workMode === "ready" ? "text-emerald-500 animate-bounce" : "text-amber-500"} />
                      <span className={workMode === "ready" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                        {workMode === "ready" ? "Available for Work" : "Away"}
                      </span>
                    </div>
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${workMode === "ready" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${workMode === "ready" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                    </span>
                  </button>
                )}
                <button onClick={onLogout} className="px-4 py-3 rounded-xl text-red-500 font-semibold text-left flex items-center gap-3"><LogOut size={18} />Log Out</button>
              </motion.div>
            )}
          </AnimatePresence>

         {/* Main content scroll area */}
         <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
             <main className="flex-1 flex flex-col pt-14 md:pt-0 min-h-full">
                {children}
             </main>
         </div>
      </div>
    );
  }

  // STANDARD LAYOUT (Unauthenticated or Landing Page)
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative transition-colors duration-200 flex flex-col">
      {/* Floating Pill Navbar */}
      <header data-testid="main-header" className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={`pointer-events-auto bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-default)] rounded-2xl transition-all duration-300 ${scrolled ? "shadow-[0_15px_30px_rgba(124,92,255,0.15)] border-[var(--violet-border)] scale-[0.99]" : ""} px-4 h-14 flex items-center gap-5 w-full max-w-5xl`}>
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2 pl-1 pr-2">
            <YbexLogo className="h-auto" />
          </Link>

          {/* Clean Navbar */}
          <div className="hidden md:flex items-center gap-2 mx-auto">
            <NavItem to="/campaigns" testId="nav-explore">Live Campaigns</NavItem>
            <NavItem to="/creators" testId="nav-explore-creators">Explore Creators</NavItem>
            {user && <NavItem to="/campaigns" testId="nav-campaigns">Campaigns</NavItem>}
            <NavItem to="/ugc-orders" testId="nav-ugc-orders">
              <span className="flex items-center gap-1.5 font-semibold">
                <Film size={14} className="text-[#D9F111]" />
                Live UGC Orders
              </span>
            </NavItem>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {user && <NotificationBell />}
            

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--violet)] hover:bg-[#6B4AFF] transition-all shadow-md">Dashboard</Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" data-testid="nav-login" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Sign In</Link>
                <Link to="/signup" data-testid="nav-signup" className="px-4 py-2 bg-[#D9F111] text-black font-semibold rounded-xl text-xs hover:bg-[#D9F111]/85 shadow-[0_4px_15px_rgba(217,241,17,0.3)] transition-all transform hover:scale-105 duration-200">Get Ybex</Link>
              </div>
            )}
            <button className="md:hidden p-2 text-[var(--text-secondary)]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-20 left-4 right-4 z-40 md:hidden bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-default)] rounded-2xl shadow-2xl p-3 flex flex-col gap-1 origin-top overflow-hidden"
          >
            <Link to="/creators" className="px-4 py-3 rounded-xl hover:bg-foreground/5 text-sm font-medium">Explore Creators</Link>
            <Link to="/campaigns" className="px-4 py-3 rounded-xl hover:bg-foreground/5 text-sm font-medium">Campaigns</Link>
            <Link to="/ugc-orders" className="px-4 py-3 rounded-xl hover:bg-foreground/5 text-sm font-medium flex items-center gap-2">
              <Film size={15} className="text-[#D9F111]"/> Live UGC Orders
            </Link>
            {!user && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border-default)]">
                <Link to="/login" className="p-2.5 rounded-xl text-center bg-[var(--bg-elevated)] text-sm font-semibold border border-[var(--border-default)]">Sign In</Link>
                <Link to="/signup" className="p-2.5 rounded-xl text-center bg-[#D9F111] text-black text-sm font-semibold">Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className={`flex-1 ${isAuthPage ? "pt-0" : "pt-20"} min-h-[calc(100vh-280px)]`}>{children}</main>

      {/* Premium Minimal Footer */}
      {!isAuthPage && location.pathname !== "/" && (
        <footer className="relative border-t border-[var(--border-default)] mt-24 bg-[var(--bg-base)] py-20 overflow-hidden">
          <div className="absolute bottom-[-1.5rem] lg:bottom-[-3rem] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
            <span className="font-display text-[15vw] font-black text-[var(--text-primary)]/5 uppercase tracking-[0.22em] leading-none select-none filter blur-[1px]">
              YBEX
            </span>
          </div>

          <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row text-xs tracking-wider text-[var(--text-primary)]/45">
            <div className="font-display font-medium text-center md:text-left select-none uppercase">
              © 2026 YBEX MEDIA. ALL RIGHTS RESERVED.
            </div>

            <div className="flex items-center gap-2 select-none uppercase text-[var(--text-primary)]/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>STATUS: OPERATIONAL</span>
            </div>

            <div className="flex items-center gap-5 select-none font-bold">
              <Link to="/privacy-policy" className="hover:text-[var(--text-primary)] transition-colors uppercase">
                PRIVACY POLICY
              </Link>
              <a href="https://ybexmedia.com" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)] transition-colors uppercase">
                YBEXMEDIA.COM
              </a>
              {user?.role === "admin" && (
                <Link to="/admin" className="text-[#D9F111] hover:underline hover:text-[#D9F111]/90 uppercase flex items-center gap-1">
                  <ShieldAlert size={12}/> ADMIN
                </Link>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

const NavItem = ({ to, testId, children }) => (
  <NavLink to={to} data-testid={testId} className={({isActive}) => `px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive ? "text-[var(--text-primary)] bg-[var(--text-primary)]/10 shadow-[inner_0_1px_5px_rgba(255,255,255,0.05)] border border-[var(--text-primary)]/5" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5"}`}>{children}</NavLink>
);
