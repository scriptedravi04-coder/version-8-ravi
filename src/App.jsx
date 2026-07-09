import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import GlobalLoader from "./components/layout/GlobalLoader";
import Layout from "./components/layout/Layout";
import Landing from "./pages/dashboard/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AuthCallback from "./pages/auth/AuthCallback";
import Onboarding from "./pages/auth/Onboarding";
import Explore from "./pages/dashboard/Explore";
import CreatorProfile from "./pages/creator/CreatorProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import Campaigns from "./pages/campaigns/Campaigns";


import CampaignDetail from "./pages/campaigns/CampaignDetail";
import Collabs from "./pages/collabs/Collabs";
import DealDetail from "./pages/collabs/DealDetail";
import AddCollab from "./pages/collabs/AddCollab";
import UploadedCollab from "./pages/collabs/UploadedCollab";
import Leaderboard from "./pages/dashboard/Leaderboard";
import Notifications from "./pages/dashboard/Notifications";
import Settings from "./pages/dashboard/Settings";
import Earnings from "./pages/dashboard/Earnings";
import Chat from "./pages/dashboard/Chat";
import Admin from "./pages/admin/Admin";
import UgcOrders from "./pages/ugc/UgcOrders";
import PrivacyPolicy from "./pages/dashboard/PrivacyPolicy";
import InfoHub from "./pages/dashboard/InfoHub";
import CreatorCampaignFlow from "./pages/creator/CreatorCampaignFlow";
import MyProfile from "./pages/profile/MyProfile";

// Brand Specific Pages
import BrandCampaigns from "./pages/brand/BrandCampaigns";
import BrandCampaignCreate from "./pages/brand/BrandCampaignCreate";
import BrandCampaignApplicants from "./pages/brand/BrandCampaignApplicants";
import BrandInbox from "./pages/brand/BrandInbox";
import BrandPayments from "./pages/brand/BrandPayments";
import BrandKyc from "./pages/brand/BrandKyc";

import PublicUGC from "./pages/ugc/PublicUGC";
import BrandUGCBriefs from "./pages/brand/BrandUGCBriefs";
import BrandUGCPost from "./pages/brand/BrandUGCPost";
import BrandUGCOrders from "./pages/brand/BrandUGCOrders";
import BrandUGCPayments from "./pages/brand/BrandUGCPayments";
import CreatorUGCBrowse from "./pages/creator/CreatorUGCBrowse";
import CreatorUGCOrders from "./pages/creator/CreatorUGCOrders";
import CreatorUGCEarnings from "./pages/creator/CreatorUGCEarnings";

const BrandConstructionScene = () => (
  <div className="relative w-64 h-64 mx-auto my-6 select-none pointer-events-none drop-shadow-2xl">
    <motion.div animate={{x: [-10, 10, -10]}} transition={{duration: 6, repeat: Infinity, ease: 'easeInOut'}} className="absolute top-4 right-8 text-[var(--text-primary)]/10">
       <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5c-.179 0-.353.021-.522.062C16.48 7.618 14.417 6 12 6c-2.417 0-4.48 1.618-4.978 4.062a4.48 4.48 0 0 0-.522-.062C4.015 10 2 12.015 2 14.5S4.015 19 6.5 19h11z"/></svg>
    </motion.div>
    <motion.div animate={{x: [15, -5, 15]}} transition={{duration: 5, repeat: Infinity, ease: 'easeInOut'}} className="absolute top-12 left-0 text-[var(--text-primary)]/5">
       <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5c-.179 0-.353.021-.522.062C16.48 7.618 14.417 6 12 6c-2.417 0-4.48 1.618-4.978 4.062a4.48 4.48 0 0 0-.522-.062C4.015 10 2 12.015 2 14.5S4.015 19 6.5 19h11z"/></svg>
    </motion.div>

    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 shadow-2xl z-10">
      <div className="bg-[var(--bg-card)] p-2 rounded-t-xl border-x-4 border-t-4 border-[#24283B] relative overflow-hidden h-28">
         <div className="absolute inset-0 bg-black rounded m-1 border border-[var(--border-default)]"></div>
      </div>
      <div className="bg-[#24283B] h-4 w-52 -ml-2 rounded-b-xl relative shadow-xl">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#414868] rounded-b-lg"></div>
      </div>
    </div>

    <motion.div className="absolute top-16 right-4 text-[var(--text-primary)]/20 z-0" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>
    </motion.div>

    <div className="absolute bottom-8 left-10 w-6 h-40 bg-amber-500 rounded border-x-4 border-amber-600 z-10 flex flex-col justify-evenly items-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
      {[1,2,3,4].map(i => <div key={i} className="w-3 h-3 border-2 border-amber-600/50 rounded-sm"></div>)}
    </div>

    <div className="absolute bottom-[10.5rem] left-8 w-10 h-10 bg-[var(--bg-card)] rounded-t-lg rounded-bl-sm border-2 border-amber-500 z-20 overflow-hidden shadow-lg">
       <div className="w-full h-1/2 bg-blue-400/20 backdrop-blur border-b border-[var(--border-default)]"></div>
    </div>

    <motion.div className="absolute bottom-[11rem] left-10 w-44 h-5 bg-amber-500 border-y-4 border-amber-600 origin-left z-10 rounded-r-md shadow-lg" animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <motion.div className="absolute top-2 left-28 w-1 h-20 bg-foreground/30 flex flex-col items-center justify-end origin-top" animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <div className="w-5 h-3 bg-slate-600 rounded-t-sm shadow shadow-black border border-white/20"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-[#7AA2F7] to-[#3b82f6] rounded-xl shadow-xl shadow-[#7AA2F7]/40 border-2 border-[#a7c5fb] p-2 flex items-center justify-center text-[var(--text-primary)] relative">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.5 7c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-5 5L7 12.5 5 15v4h14v-1.5l-4.5-5.5-5 6z"/></svg>
        </div>
      </motion.div>
    </motion.div>

    <div className="absolute bottom-12 left-1/2 -translate-x-[40%] w-56 h-6 z-30 -rotate-6 overflow-hidden rounded-sm shadow-2xl shadow-black/80 border-y-2 border-amber-500 bg-amber-400">
      <motion.div className="h-full w-[200%]" animate={{ x: [0, -40] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.8) 15px, rgba(0,0,0,0.8) 30px)' }} />
    </div>

    <div className="absolute bottom-4 left-[20%] z-20 transition-transform hover:scale-110">
       <div className="w-5 h-2 bg-orange-600 rounded-full mx-auto" />
       <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[20px] border-l-transparent border-r-transparent border-b-orange-500 absolute bottom-1 left-1/2 -translate-x-1/2" />
       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white rounded-sm drop-shadow-md"></div>
    </div>
    
    <div className="absolute bottom-6 right-[20%] z-20 scale-75 transform drop-shadow-lg">
       <div className="w-5 h-2 bg-orange-600 rounded-full mx-auto" />
       <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[20px] border-l-transparent border-r-transparent border-b-orange-500 absolute bottom-1 left-1/2 -translate-x-1/2" />
       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white rounded-sm drop-shadow-md"></div>
    </div>
  </div>
);

const CreatorUpgradeScene = () => (
  <div className="relative w-64 h-64 mx-auto my-6 select-none pointer-events-none drop-shadow-2xl">
     <motion.div animate={{y: [40, 160], opacity: [0, 1, 0]}} transition={{duration: 0.8, repeat: Infinity, ease: 'linear'}} className="absolute top-0 right-16 w-0.5 h-16 bg-blue-400/20 rounded-full" />
     <motion.div animate={{y: [20, 150], opacity: [0, 1, 0]}} transition={{duration: 0.6, repeat: Infinity, ease: 'linear'}} className="absolute top-10 left-16 w-1 h-8 bg-purple-400/30 rounded-full" />

     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-[var(--bg-card)]/80 backdrop-blur border border-[var(--border-default)] flex items-center justify-center shadow-2xl">
           <svg className="w-8 h-8 text-blue-500/30" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
     </div>
     
     <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-12 border border-[#9D7CFF]/20 rounded-[50%] [transform:rotate(-20deg)]" animate={{ rotateZ: [-20, -20] }}>
       <motion.div animate={{ x: [-20, 200, -20], zIndex: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-3 h-3 bg-[#9D7CFF] rounded-full shadow-[0_0_15px_#9D7CFF] transform -translate-y-1.5" />
     </motion.div>

     <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center" animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <div className="relative w-14 h-24 bg-gradient-to-b from-white to-slate-200 rounded-t-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-slate-300 overflow-hidden flex flex-col items-center pt-4">
           <div className="w-6 h-6 bg-[var(--bg-card)] rounded-full border-4 border-blue-500 relative flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-[var(--bg-elevated)]0 rounded-full absolute top-0.5 left-0.5"></div>
           </div>
           <div className="absolute bottom-0 w-full h-8 bg-slate-300 border-t border-slate-400 opacity-50"></div>
        </div>
        
        <div className="absolute top-[4.5rem] -left-[14px] w-5 h-8 bg-gradient-to-tr from-red-600 to-red-500 rounded-bl-xl origin-right -rotate-12 border border-red-700 shadow-md"></div>
        <div className="absolute top-[4.5rem] -right-[14px] w-5 h-8 bg-gradient-to-tl from-red-600 to-red-500 rounded-br-xl origin-left rotate-12 border border-red-700 shadow-md"></div>
        <div className="absolute top-[5rem] left-1/2 -translate-x-1/2 w-2 h-6 bg-red-800 rounded-b-md z-[-1]"></div>

        <motion.div 
           className="w-8 h-16 bg-gradient-to-b from-orange-400 via-yellow-400 to-transparent rounded-b-full mt-[-2px] blur-[2px]"
           animate={{ scaleY: [0.9, 1.2, 0.9], opacity: [0.8, 1, 0.8] }}
           transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
        />
     </motion.div>
  </div>
);

function ProtectedRoute({ children, requireOnboarded = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarded && !user.onboarded && !user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return children;
}

function BrandRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'brand') return <Navigate to="/dashboard" replace />;
  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] };

function Page({ children }) {
  return (
    <motion.div className="flex-1 flex flex-col min-h-full w-full" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Page><Landing /></Page></Layout>} />
        <Route path="/login" element={<Layout><Page><Login /></Page></Layout>} />
        <Route path="/signup" element={<Layout><Page><Signup /></Page></Layout>} />
        <Route path="/onboarding" element={<ProtectedRoute><Layout><Page><Onboarding /></Page></Layout></ProtectedRoute>} />
        <Route path="/creators" element={<Layout><Page><Explore /></Page></Layout>} />
        <Route path="/creator/:id" element={<Layout><Page><CreatorProfile /></Page></Layout>} />
        <Route path="/profile/overview" element={<ProtectedRoute><Layout><Page><MyProfile /></Page></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireOnboarded><Layout><Page><Dashboard /></Page></Layout></ProtectedRoute>} />
        <Route path="/campaigns" element={<Layout><Page><Campaigns /></Page></Layout>} />
        <Route path="/campaigns/:id" element={<Layout><Page><CampaignDetail /></Page></Layout>} />
        <Route path="/collabs" element={<ProtectedRoute><Layout><Page><Collabs /></Page></Layout></ProtectedRoute>} />
        <Route path="/deals/:id" element={<ProtectedRoute><Layout><Page><DealDetail /></Page></Layout></ProtectedRoute>} />
        <Route path="/deals/:id/add-collab" element={<ProtectedRoute><Layout><Page><AddCollab /></Page></Layout></ProtectedRoute>} />
        <Route path="/deals/:id/uploaded-collab" element={<ProtectedRoute><Layout><Page><UploadedCollab /></Page></Layout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Layout><Page><Chat /></Page></Layout></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Layout><Page><Chat /></Page></Layout></ProtectedRoute>} />

        {/* Brand Dedicated Routes */}
        <Route path="/brand/campaigns" element={<BrandRoute><Layout><Page><BrandCampaigns /></Page></Layout></BrandRoute>} />
        <Route path="/brand/campaigns/create" element={<BrandRoute><Layout><Page><BrandCampaignCreate /></Page></Layout></BrandRoute>} />
        <Route path="/brand/campaigns/:id/applicants" element={<BrandRoute><Layout><Page><BrandCampaignApplicants /></Page></Layout></BrandRoute>} />
        <Route path="/brand/inbox" element={<BrandRoute><Layout><Page><BrandInbox /></Page></Layout></BrandRoute>} />
        <Route path="/brand/payments" element={<BrandRoute><Layout><Page><BrandPayments /></Page></Layout></BrandRoute>} />
        <Route path="/brand/kyc" element={<BrandRoute><Layout><Page><BrandKyc /></Page></Layout></BrandRoute>} />
        
        {/* Brand UGC */}
        <Route path="/brand/ugc/briefs" element={<BrandRoute><Layout><Page><BrandUGCBriefs /></Page></Layout></BrandRoute>} />
        <Route path="/brand/ugc/post" element={<BrandRoute><Layout><Page><BrandUGCPost /></Page></Layout></BrandRoute>} />
        <Route path="/brand/ugc/orders" element={<BrandRoute><Layout><Page><BrandUGCOrders /></Page></Layout></BrandRoute>} />
        <Route path="/brand/ugc/payments" element={<BrandRoute><Layout><Page><BrandUGCPayments /></Page></Layout></BrandRoute>} />
        
        {/* Creator UGC */}
        <Route path="/creator/ugc/browse" element={<ProtectedRoute><Layout><Page><CreatorUGCBrowse /></Page></Layout></ProtectedRoute>} />
        <Route path="/creator/ugc/orders" element={<ProtectedRoute><Layout><Page><CreatorUGCOrders /></Page></Layout></ProtectedRoute>} />
        <Route path="/creator/ugc/earnings" element={<ProtectedRoute><Layout><Page><CreatorUGCEarnings /></Page></Layout></ProtectedRoute>} />

        <Route path="/ugc" element={<Layout><Page><PublicUGC /></Page></Layout>} />
        <Route path="/leaderboard" element={<Layout><Page><Leaderboard /></Page></Layout>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><Page><Notifications /></Page></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Page><Settings /></Page></Layout></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute><Layout><Page><Earnings /></Page></Layout></ProtectedRoute>} />
        <Route path="/refer" element={<ProtectedRoute><Layout><Page><div className="flex flex-col items-center justify-center h-full p-8"><h1 className="text-2xl font-bold mb-4">Refer & Earn</h1><p className="text-gray-500">Coming soon!</p></div></Page></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><Page><Admin /></Page></Layout></ProtectedRoute>} />
        <Route path="/ugc-orders" element={<Layout><Page><UgcOrders /></Page></Layout>} />
        <Route path="/privacy-policy" element={<Layout><Page><PrivacyPolicy /></Page></Layout>} />
        <Route path="/info/:slug" element={<Layout><Page><InfoHub /></Page></Layout>} />
        <Route path="/creator-campaign-flow" element={<Layout><Page><CreatorCampaignFlow /></Page></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [maintenance, setMaintenance] = React.useState(null);

  React.useEffect(() => {
     fetch('/api/system-status')
       .then(r => r.json())
       .then(d => setMaintenance(d))
       .catch(() => {});
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <GlobalLoader />
              <MaintenanceWrapper maintenance={maintenance}>
                <AnimatedRoutes />
              </MaintenanceWrapper>
              <Toaster position="top-right" theme="light" richColors />
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

function MaintenanceWrapper({ children, maintenance }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (loading) return children;

  const publicRoutes = ['/', '/login', '/signup', '/register', '/onboarding'];
  if (publicRoutes.includes(location.pathname) || !user || user.role === 'admin') {
     return children;
  }

  const isCreatorMaintenance = user.role === 'creator' && maintenance?.maintenance_mode_creator;
  const isBrandMaintenance = user.role === 'brand' && maintenance?.maintenance_mode_brand;

  if (isCreatorMaintenance) {
     return (
       <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
             <CreatorUpgradeScene />
             <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 text-[var(--text-primary)]">
               App <span className="text-blue-400">Upgrade</span>
             </h1>
             <p className="text-[var(--text-primary)]/60 text-lg mb-8">
               We're adding some cool new features. We'll be back online in a few hours!
             </p>
             <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex items-center gap-2 justify-center text-sm font-medium text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20 inline-flex">
                   <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Scheduled Tune-Up
                </div>
                <div className="flex items-center gap-4 mt-2">
                   <a href="mailto:support@ybex.io" className="text-xs text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 border border-[var(--border-default)] px-4 py-2 rounded-full hover:bg-foreground/5 bg-[var(--bg-elevated)]">
                      ✉️ Email Support
                   </a>
                   <a href="tel:+18001234567" className="text-xs text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 border border-[var(--border-default)] px-4 py-2 rounded-full hover:bg-foreground/5 bg-[var(--bg-elevated)]">
                      📞 Call Team
                   </a>
                </div>
                
                <button
                   onClick={async () => {
                      await logout();
                      navigate("/login");
                   }}
                   className="mt-6 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 border border-red-500/10 hover:border-red-500/30 px-5 py-2.5 rounded-full bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer shadow-sm"
                >
                   🔓 Log Out / Change Account
                </button>
             </div>
          </div>
       </div>
     );
  }

  if (isBrandMaintenance) {
     return (
       <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
             <BrandConstructionScene />
             <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 text-[var(--text-primary)]">
               Quick <span className="text-amber-500">Update</span>
             </h1>
             <p className="text-[var(--text-primary)]/60 text-lg mb-8">
               We are making the platform better for you. Back online shortly!
             </p>
             <div className="flex flex-col items-center gap-4 mt-4">
                <div className="flex items-center gap-2 justify-center text-sm font-medium text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 inline-flex">
                   <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Offline for Upgrades
                </div>
                <div className="flex items-center gap-4 mt-2">
                   <a href="mailto:support@ybex.io" className="text-xs text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 border border-[var(--border-default)] px-4 py-2 rounded-full hover:bg-foreground/5 bg-[var(--bg-elevated)]">
                      ✉️ Email Support
                   </a>
                   <a href="tel:+18001234567" className="text-xs text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 border border-[var(--border-default)] px-4 py-2 rounded-full hover:bg-foreground/5 bg-[var(--bg-elevated)]">
                      📞 Call Team
                   </a>
                </div>

                <button
                   onClick={async () => {
                      await logout();
                      navigate("/login");
                   }}
                   className="mt-6 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 border border-red-500/10 hover:border-red-500/30 px-5 py-2.5 rounded-full bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer shadow-sm"
                >
                   🔓 Log Out / Change Account
                </button>
             </div>
          </div>
       </div>
     );
  }
  
  return children;
}
