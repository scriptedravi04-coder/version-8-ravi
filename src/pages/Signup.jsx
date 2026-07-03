import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import YbexLogo from "../components/YbexLogo";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

// USP data for sliding/fade effect
const USPS = [
  {
    title: "Start Collaborating",
    coloredTitle: "Direct & Free",
    desc: "Join India's most innovative brand and creator ecosystem with dynamic, hidden optimization margins. Protect your true rates.",
    stats: [
      { num: "100%", text: "Transparent Deals" },
      { num: "Instant", text: "Onboarding" },
      { num: "Secure", text: "Escrow release" }
    ]
  },
  {
    title: "Deliver Instant Videos",
    coloredTitle: "In Under 24 Hours",
    desc: "Got rapid content requests? Sign up, claim high-priority orders, record your UGC videos, and get paid instantly within the chat workspace.",
    stats: [
      { num: "24h", text: "Standard" },
      { num: "15h", text: "In-house SLA" },
      { num: "Top", text: "Revenue Split" }
    ]
  },
  {
    title: "Secure Privacy Shield",
    coloredTitle: "No Off-Platform Leak",
    desc: "We guard personal contact data, filter out external details dynamically, negotiate directly, and secure payments so you never lose control.",
    stats: [
      { num: "100%", text: "Privacy Protected" },
      { num: "Zero", text: "Direct fee" },
      { num: "Instant", text: "Live Support" }
    ]
  }
];

export default function Signup() {
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(params.get("role") || "creator"); // matching role choice
  const { user, signup, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Sliding slide state
  const [slideIdx, setSlideIdx] = useState(0);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate(user.onboarded || user.onboarding_completed ? "/dashboard" : "/onboarding");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % USPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "OAUTH_SUCCESS") {
        toast.success("Account created successfully!");
        setLoading(true);

        const { token, supabaseSession } = event.data;
        if (token) {
          localStorage.setItem("ybex_token", token);
        }

        if (supabaseSession) {
          supabase.auth.setSession({
            access_token: supabaseSession.access_token,
            refresh_token: supabaseSession.refresh_token
          }).catch((err) => {
            console.error("Error setting frontend Supabase session:", err);
          });
        }

        refreshUser().then((user) => {
          setLoading(false);
          if (user) {
            navigate(`/onboarding?role=${role}`);
          }
        });
      } else if (event.data?.type === "OAUTH_FAILURE") {
        toast.error("Google sign up failed");
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [navigate, refreshUser, role]);

  const handleGoogle = async () => {
    try {
      const redirectUri = window.location.origin + "/api/auth/google/callback";
      const clientRedirectUri = window.location.origin + "/onboarding";
      const { data } = await api.get(`/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}&client_redirect_uri=${encodeURIComponent(clientRedirectUri)}`);
      
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        data.url,
        "google_auth_popup",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
      
      if (!popup) {
        toast.error("Popup blocked! Please allow popups for this site to sign up.");
      }
    } catch (err) {
      console.error("Google login initiation failed:", err);
      const errMsg = err.response?.data?.error || "Google Auth is missing some configuration on the server. Please check environment variables.";
      toast.error(errMsg, { duration: 6000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
       toast.error("You must agree to the Terms of Service & Privacy Policy");
       return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, role, phone);
      toast.success("Account created!");
      navigate(`/onboarding?role=${role}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally { setLoading(false); }
  };

  const activeUSP = USPS[slideIdx];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-base)] text-[var(--text-primary)]" data-testid="signup-page">
      {/* LEFT PANEL — Smooth horizontal gradient blending into deep black, wider span — Hidden on mobile / tablet for clean auth flow */}
      <section className="hidden lg:flex lg:col-span-7 bg-gradient-to-b lg:bg-gradient-to-r from-card via-background to-background p-10 md:p-14 flex-col justify-between relative overflow-hidden min-h-[50vh] lg:min-h-screen">
        {/* Subtle grid background accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient colored blobs to smooth out different container vibes */}
        <div className="absolute bottom-1/4 -left-10 w-[450px] h-[450px] bg-[var(--violet)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[350px] h-[350px] bg-[#D9F111]/4 rounded-full blur-[100px] pointer-events-none" />

        {/* USP Slideshow container */}
        <div className="my-auto py-12 z-10 max-w-xl relative min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <h2 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl text-[var(--text-primary)] leading-tight font-bold tracking-tight">
                {activeUSP.title} <br />
                <span className="text-[#D9F111] font-black">{activeUSP.coloredTitle}</span>
              </h2>
              <p className="text-[var(--text-primary)] mt-6 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
                {activeUSP.desc}
              </p>

              {/* Stats list */}
              <div className="mt-6 grid grid-cols-3 gap-6">
                {activeUSP.stats.map((stat, sId) => (
                  <div key={sId}>
                    <div className="font-display font-black text-3xl sm:text-4xl lg:text-4xl xl:text-5xl text-[#7C5CFF]" data-testid={`stat-num-${sId}`}>
                      {stat.num}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-primary)]/60 font-bold uppercase tracking-wider mt-2" data-testid={`stat-lbl-${sId}`}>
                      {stat.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom copyright */}
        <div className="text-xs text-[var(--text-primary)]/30 font-semibold z-10 uppercase tracking-widest select-none pt-4 border-t border-foreground/5">
          2026 Ybex Media. All rights reserved.
        </div>
      </section>

      {/* RIGHT PANEL — Clean, spacious signup screen matching mockup spacing — Compact & centered for mobile */}
      <section className="lg:col-span-5 flex flex-col justify-center items-center pt-24 sm:pt-12 pb-12 px-6 sm:p-12 md:p-16 lg:p-24 bg-[var(--bg-base)] min-h-screen">
        <div className="w-full max-w-sm sm:max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--text-primary)] font-bold tracking-tight">Create your account</h1>
            <p className="text-[var(--text-primary)]/60 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">Start collaborating with India&apos;s premium brand network.</p>
          </div>

          {/* Selector Tabs matching login role choices */}
          <div className="p-1 bg-foreground/5 border border-[var(--border-default)] rounded-xl grid grid-cols-2 gap-1 mb-5 sm:mb-6">
            <button
              onClick={() => setRole("creator")}
              type="button"
              className={`py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${role === "creator" ? "bg-[var(--violet)] text-white shadow-md shadow-[#7C5CFF]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              👤 Creator
            </button>
            <button
              onClick={() => setRole("brand")}
              type="button"
              className={`py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${role === "brand" ? "bg-[var(--violet)] text-white shadow-md shadow-[#7C5CFF]/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              🏢 Brand
            </button>
          </div>

          {/* Social Sign Up Option */}
          <button
            onClick={handleGoogle}
            data-testid="google-signup-btn"
            className="w-full bg-foreground/5 border border-[var(--border-default)] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:bg-foreground/10 hover:border-foreground/20 transition-all flex items-center justify-center gap-2 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.2 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.2 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.1z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-4 my-4 sm:my-6">
            <div className="flex-1 h-px bg-foreground/10"></div>
            <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)] font-black tracking-widest uppercase">OR</span>
            <div className="flex-1 h-px bg-foreground/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[var(--text-primary)]/60 block mb-1 sm:mb-1.5">First Name</label>
                <input
                  data-testid="signup-first-name"
                  type="text"
                  required
                  value={name.split(" ")[0] || ""}
                  onChange={(e) => {
                    const lastName = name.split(" ").slice(1).join(" ");
                    setName(`${e.target.value} ${lastName}`.trim());
                  }}
                  className="w-full bg-foreground/5 border border-[var(--border-default)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-white/30 outline-none focus:border-[var(--violet)]/20 focus:bg-[#13131F] transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[var(--text-primary)]/60 block mb-1 sm:mb-1.5">Last Name</label>
                <input
                  data-testid="signup-last-name"
                  type="text"
                  required
                  value={name.split(" ").slice(1).join(" ") || ""}
                  onChange={(e) => {
                    const firstName = name.split(" ")[0] || "";
                    setName(`${firstName} ${e.target.value}`.trim());
                  }}
                  className="w-full bg-foreground/5 border border-[var(--border-default)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-white/30 outline-none focus:border-[var(--violet)]/20 focus:bg-[#13131F] transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[var(--text-primary)]/60 block mb-1 sm:mb-1.5">Email</label>
              <input
                data-testid="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-foreground/5 border border-[var(--border-default)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-white/30 outline-none focus:border-[var(--violet)]/20 focus:bg-[#13131F] transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[var(--text-primary)]/60 block mb-1 sm:mb-1.5">Phone Number</label>
              <input
                data-testid="signup-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-foreground/5 border border-[var(--border-default)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-white/30 outline-none focus:border-[var(--violet)]/20 focus:bg-[#13131F] transition-all"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[var(--text-primary)]/60 block mb-1 sm:mb-1.5">Password</label>
              <input
                data-testid="signup-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-foreground/5 border border-[var(--border-default)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-white/30 outline-none focus:border-[var(--violet)]/20 focus:bg-[#13131F] transition-all"
                placeholder="Create a password"
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">Must be at least 8 characters</p>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 flex-shrink-0 appearance-none w-4 h-4 border border-foreground/20 rounded bg-foreground/5 checked:bg-[var(--violet)] checked:border-[#7C5CFF] relative cursor-pointer
                 after:content-[''] after:absolute after:hidden after:checked:block after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:left-1/2 after:-translate-x-1/2 after:top-[1px] after:rotate-45"
              />
              <label htmlFor="terms" className="text-xs text-[var(--text-primary)]/60 leading-tight">
                I agree to the <a href="#" className="text-[#7C5CFF] hover:underline">Terms of Service</a> and <a href="#" className="text-[#7C5CFF] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              data-testid="signup-submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 sm:py-3 bg-[var(--violet)] text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#6849E0] shadow-[0_4px_16px_rgba(124,92,255,0.3)] hover:shadow-[0_4px_20px_rgba(124,92,255,0.45)] transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 duration-150 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Account →"}
            </button>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[var(--text-primary)]/60 font-semibold">
            Already have an account?{" "}
            <Link to="/login" className="text-[#D9F111] font-black hover:underline animate-pulse">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
