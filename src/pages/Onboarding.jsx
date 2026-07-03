import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CreatorOnboardingFlow from "../components/Onboarding/CreatorOnboardingFlow";
import BrandOnboardingFlow from "../components/Onboarding/BrandOnboardingFlow";
import { LogOut } from "lucide-react";

export default function Onboarding() {
  const { user, refreshUser, setUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If they finish onboarding, send them off
    if (user?.onboarding_completed || user?.onboarded) {
      if (user.role === 'brand') navigate('/dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans relative overflow-hidden">
      <div className="absolute top-6 left-6 md:left-8 font-display font-black text-2xl tracking-tighter cursor-pointer z-50 pointer-events-auto" onClick={() => navigate("/")}>
        ybex<span className="text-[#3B82F6]">.</span>
      </div>
      <button 
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
        className="absolute top-6 right-6 md:right-8 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition z-50 pointer-events-auto bg-foreground/5 px-4 py-2 rounded-xl border border-[var(--border-default)]"
      >
        <LogOut size={16} /> Logout
      </button>

      {user?.role === 'brand' ? (
        <BrandOnboardingFlow user={user} onComplete={async () => { 
           setUser({ ...user, onboarding_completed: true });
           try { await refreshUser(); } catch(e){}
           navigate('/dashboard'); 
        }} />
      ) : (
        <CreatorOnboardingFlow user={user} onComplete={async () => {
           setUser({ ...user, onboarding_completed: true });
           try { await refreshUser(); } catch(e){}
           navigate('/dashboard'); 
        }} />
      )}
    </div>
  );
}
