import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, AlertCircle, CheckCircle, ArrowRight, X, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationsOverlay() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const [kycObj, setKycObj] = useState(null);
  
  const [showCompletenessPopup, setShowCompletenessPopup] = useState(false);
  const [showKycPromoPopup, setShowKycPromoPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile data analysis
  const [completeness, setCompleteness] = useState({
    percent: 100,
    isComplete: true,
    missingFields: []
  });

  useEffect(() => {
    if (!user || user.role === "admin") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function checkVerificationsAndProfile() {
      try {
        // 1. Fetch user's KYC verification status
        let kycData = null;
        try {
          const res = await api.get("/verifications/me");
          kycData = res.data;
          if (isMounted) {
            setKycObj(kycData);
            setKycStatus(kycData ? kycData.status : null);
          }
        } catch (e) {
          console.warn("Could not load KYC status", e);
        }

        // 2. Fetch profile to check completeness
        let prof = null;
        if (user.role === "creator") {
          try {
            const { data } = await api.get(`/creators/${user.id}`);
            prof = data;
          } catch (e) {
            console.warn("Could not load creator profile", e);
          }
        } else if (user.role === "brand") {
          try {
            const { data } = await api.get("/brands/me");
            prof = data;
          } catch (e) {
            console.warn("Could not load brand profile", e);
          }
        }

        if (!isMounted) return;
        setProfile(prof);

        // 3. Analyze Profile Completeness
        if (user.role === "creator") {
          const checks = [
            { label: "Content Category/Niche", check: prof?.category || prof?.niche },
            { label: "Sub-categories", check: prof?.sub_categories && prof.sub_categories.length > 0 },
            { label: "Languages", check: prof?.languages && prof.languages.length > 0 },
            { label: "Current Location", check: prof?.city || prof?.state },
            { label: "Registered Phone", check: prof?.rate_card?.extras?.phone || prof?.phone },
            { label: "Business Email", check: prof?.email || prof?.businessEmail },
            { label: "Social Media Handle", check: prof?.instagram || prof?.youtube }
          ];
          const missing = checks.filter(c => !c.check);
          const total = checks.length;
          const completed = total - missing.length;
          const percent = Math.round((completed / total) * 100);

          setCompleteness({
            percent,
            isComplete: missing.length === 0,
            missingFields: missing.map(m => m.label)
          });

          // Logic for popups on mount (session storage to avoid blocking clicks inside same session, but runs on full refresh / visit)
          const sessionProfileAlertShown = sessionStorage.getItem("ybex_profile_alert_shown");
          const sessionKycAlertShown = sessionStorage.getItem("ybex_kyc_alert_shown");

          if (missing.length > 0) {
            if (!sessionProfileAlertShown && location.pathname !== "/settings") {
              setShowCompletenessPopup(true);
              sessionStorage.setItem("ybex_profile_alert_shown", "true");
            }
          } else {
            // Profile is fully complete! Now evaluate KYC requirement popup
            const isApproved = kycData?.status === "approved" || user.verified;
            const isPending = kycData?.status === "pending";

            if (!isApproved && !isPending && !sessionKycAlertShown && location.pathname !== "/settings") {
              setShowKycPromoPopup(true);
              sessionStorage.setItem("ybex_kyc_alert_shown", "true");
            }
          }
        } else if (user.role === "brand") {
          const checks = [
            { label: "Company Name", check: prof?.company_name || prof?.name },
            { label: "Industry Focus", check: prof?.industry || prof?.category },
            { label: "Registered City", check: prof?.city || prof?.state },
            { label: "Corporate Website URL", check: prof?.website },
            { label: "Authorized Contact Person", check: prof?.contact_name },
            { label: "Work Phone", check: prof?.phone },
            { label: "Work Email", check: prof?.email }
          ];

          const missing = checks.filter(c => !c.check);
          const total = checks.length;
          const completed = total - missing.length;
          const percent = Math.round((completed / total) * 100);

          setCompleteness({
            percent,
            isComplete: missing.length === 0,
            missingFields: missing.map(m => m.label)
          });

          const sessionProfileAlertShown = sessionStorage.getItem("ybex_profile_alert_shown");
          const sessionKycAlertShown = sessionStorage.getItem("ybex_kyc_alert_shown");

          if (missing.length > 0) {
            if (!sessionProfileAlertShown && location.pathname !== "/settings") {
              setShowCompletenessPopup(true);
              sessionStorage.setItem("ybex_profile_alert_shown", "true");
            }
          } else {
            const isApproved = kycData?.status === "approved" || user.verified;
            const isPending = kycData?.status === "pending";

            if (!isApproved && !isPending && !sessionKycAlertShown && location.pathname !== "/settings") {
              setShowKycPromoPopup(true);
              sessionStorage.setItem("ybex_kyc_alert_shown", "true");
            }
          }
        }
      } catch (err) {
        console.error("Verification overlay checker crash", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkVerificationsAndProfile();

    return () => { isMounted = false; };
  }, [user, location.pathname]);

  const handleGoToSettingsProfile = () => {
    setShowCompletenessPopup(false);
    navigate("/settings");
  };

  const handleGoToKycSettings = () => {
    setShowKycPromoPopup(false);
    navigate("/settings?section=kyc");
  };

  if (!user || user.role === "admin" || isLoading) return null;

  return (
    <AnimatePresence>
      {/* 1. PROFILE COMPLETENESS BLOCKING POPUP */}
      {showCompletenessPopup && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 15 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 15 }}
            className="bg-[#141424] border border-[var(--border-default)] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C5CFF]/10 rounded-full filter blur-3xl pointer-events-none" />
            <button 
              onClick={() => setShowCompletenessPopup(false)}
              className="absolute top-5 right-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="p-3.5 bg-yellow-400/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                <AlertCircle size={24} />
              </span>
              <div>
                <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">Complete Your Profile!</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Make your profile discoverable to start working</p>
              </div>
            </div>

            <div className="mb-6 bg-[var(--bg-elevated)] rounded-2xl p-5 border border-[var(--border-default)]">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2">
                <span>Profile Completeness</span>
                <span className="text-yellow-400 font-mono">{completeness.percent}%</span>
              </div>
              <div className="w-full bg-[var(--bg-elevated)] rounded-full h-2 overflow-hidden mb-4">
                <div 
                  className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completeness.percent}%` }}
                />
              </div>

              <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2.5">FOLLOWING CORE FIELDS ARE MISSING:</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-400/90 font-medium">
                {completeness.missingFields.slice(0, 6).map((item, id) => (
                  <li key={id} className="flex items-center gap-2 bg-red-400/5 px-3 py-1.5 rounded-lg border border-red-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              <strong>💡 Why Complete Your Profile?</strong> Completing your profile credentials makes you fully compliant with our brand rules. It ensures you show up automatically in the explore list, letting other users connect and select you immediately!
            </p>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCompletenessPopup(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
              >
                Skip For Now
              </button>
              <button 
                onClick={handleGoToSettingsProfile}
                className="flex-1 py-3 bg-[#7C5CFF] hover:bg-[#6D28D9] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#7C5CFF]/20 flex items-center justify-center gap-2"
              >
                Complete Profile <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 2. KYC DOCUMENTS PROMOTION POPUP */}
      {showKycPromoPopup && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 15 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 15 }}
            className="bg-[#141424] border border-[var(--border-default)] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/10 rounded-full filter blur-3xl pointer-events-none" />
            <button 
              onClick={() => setShowKycPromoPopup(false)}
              className="absolute top-5 right-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                <ShieldCheck size={24} />
              </span>
              <div>
                <div className="text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> 100% profile completed
                </div>
                <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mt-0.5">Complete Account KYC</h3>
              </div>
            </div>

            <div className="text-sm font-semibold text-[var(--text-primary)]/80 mb-3">🔒 Safe & Secured Payout Compliance</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              Your profile details are complete. To comply with local financial laws and unlock direct platform permissions, submit official verification details. It takes only 2-3 fields to register.
            </p>

            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3.5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">Trust Verified Badge</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Increases your premium acceptance chances by up to 5x.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">Direct Campaign Applications</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Allows you to actively apply to the highest paying contracts instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">Instant Safe Escrow Payouts</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Guarantees safe payment holding and direct penny-drop UPI payouts.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowKycPromoPopup(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
              >
                Decide Later
              </button>
              <button 
                onClick={handleGoToKycSettings}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 animate-pulse"
              >
                Complete KYC Now <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
