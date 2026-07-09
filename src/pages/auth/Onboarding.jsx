import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CreatorOnboarding from "../../pages/onboarding/CreatorOnboarding";
import BrandOnboardingFlow from "../../components/Onboarding/BrandOnboardingFlow";
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
      

      {user?.role === 'brand' ? (
        <BrandOnboardingFlow user={user} onComplete={async () => { 
           setUser({ ...user, onboarding_completed: true });
           try { await refreshUser(); } catch(e){}
           navigate('/dashboard'); 
        }} />
      ) : (
        <CreatorOnboarding user={user} onComplete={async () => {
           setUser({ ...user, onboarding_completed: true });
           try { await refreshUser(); } catch(e){}
           navigate('/dashboard'); 
        }} />
      )}
    </div>
  );
}
