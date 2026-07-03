/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import YbexLogo from "../components/YbexLogo";
import {
  ArrowRight, IndianRupee, TrendingUp, Map, Shield, Search, Handshake, LineChart,
  Bell, Sparkles, Award, Trophy, Medal, Instagram, Facebook, Youtube, Linkedin
} from "lucide-react";

const BRANDS = ["Nykaa","Noise","Meesho","Bewakoof","Wow Skin Science","Swiggy","Mamaearth","boAt","Moj","PhonePe","Lenskart","Zomato"];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ creators: "140K+", cities: "500+", categories: "25+", collabs: "10K+" });

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    api.get("/creators").then(({data}) => {
      // Optionally update verified counter using real data
      if (Array.isArray(data) && data.length) {
        setStats((s) => ({ ...s, creators: `${data.length}+ Demo · 140K+ Target` }));
      }
    }).catch(()=>{});
  }, []);

  return (
    <div className="text-[var(--text-primary)] overflow-hidden" data-testid="landing-page">
      <Hero/>
      <StatsBar/>
      <WhatMakesUsDifferent/>
      <BrandsMarquee/>
      <PerformanceRankShowcase/>
      <HowItWorks/>
      <FinalCTA/>
      <LandingFooter/>
    </div>
  );
}

/* ====================== LIVE EVENT TICKER ====================== */
function LiveActivityPill() {
  const [events, setEvents] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/creators").catch(() => ({ data: [] })),
      api.get("/campaigns").catch(() => ({ data: [] }))
    ]).then(([creatorsRes, campaignsRes]) => {
      const realCreators = Array.isArray(creatorsRes?.data) ? creatorsRes.data : [];
      const realCampaigns = Array.isArray(campaignsRes?.data) ? campaignsRes.data : [];

      const fallbackCreators = [
        { name: "Ravi Sharma", city: "Mumbai", category: "Fitness" },
        { name: "Ananya Iyer", city: "Bangalore", category: "Beauty" },
        { name: "Karan Bajaj", city: "Delhi", category: "Tech" },
        { name: "Priya Patel", city: "Ahmedabad", category: "Travel" },
        { name: "Siddharth Verma", city: "Kolkata", category: "Lifestyle" },
        { name: "Neha Sen", city: "Pune", category: "Fashion" }
      ];

      const fallbackCampaigns = [
        { title: "Summer Hydration Video", brand_name: "Wow Skin Science", budget_min: 15000 },
        { title: "Unboxing New Wave Buds", brand_name: "boAt", budget_min: 35000 },
        { title: "Diwali App Referral Campaign", brand_name: "Meesho", budget_min: 50000 },
        { title: "SaaS Platform Launch", brand_name: "ScribeAI", budget_min: 25000 },
        { title: "Snack Review Challenge", brand_name: "Swiggy", budget_min: 18000 }
      ];

      const list = [];
      const creatorsToUse = realCreators.length > 0 ? realCreators : fallbackCreators;
      const campaignsToUse = realCampaigns.length > 0 ? realCampaigns : fallbackCampaigns;

      // 1. Registered Events
      creatorsToUse.forEach(c => {
        list.push({
          text: `⚡ ${c.name} (${c.category || "Lifestyle"}) just registered from ${c.city || "Mumbai"}!`,
          type: "register"
        });
      });

      // 2. Campaign Launched Events
      campaignsToUse.forEach(camp => {
        const budget = camp.budget_min ? `₹${camp.budget_min.toLocaleString('en-IN')}` : `₹15,000`;
        list.push({
          text: `🔥 New Campaign: ${camp.brand_name || "Titan"} launched '${camp.title}' (${budget})`,
          type: "campaign"
        });
      });

      // 3. Selection Collaborated Events
      for (let i = 0; i < Math.max(creatorsToUse.length, 5); i++) {
        const c = creatorsToUse[i % creatorsToUse.length];
        const camp = campaignsToUse[i % campaignsToUse.length];
        list.push({
          text: `🤝 Partnership: ${c.name} just got selected for ${camp.brand_name || "Titan"}'s '${camp.title}'!`,
          type: "collab"
        });
      }

      // 4. Escrow Secured & Release Events
      for (let i = 0; i < Math.max(creatorsToUse.length, 5); i++) {
        const c = creatorsToUse[(i + 1) % creatorsToUse.length];
        const camp = campaignsToUse[(i + 1) % campaignsToUse.length];
        const budget = camp.budget_min || 15000;
        
        list.push({
          text: `🔒 Escrow Lock: ₹${budget.toLocaleString('en-IN')} secured in Ybex neutral escrow for ${c.name}`,
          type: "escrow"
        });
        list.push({
          text: `✅ Payment Received: ${c.name} got payment of ₹${Math.round(budget * 0.95).toLocaleString('en-IN')} after verified delivery!`,
          type: "payment"
        });
      }

      // Guarantee the presence of requested literal names in ticker
      list.push({ text: "⚡ Ravi just registered from Delhi!", type: "register" });
      list.push({ text: "🔥 New Campaign: Titan launched 'Ultimate Sportswear Drive'", type: "campaign" });
      list.push({ text: "🤝 Ananya just got selected for Nykaa's Summer Glowup Reel", type: "collab" });
      list.push({ text: "✅ Karan just got his payment of ₹35,000 released net of fees!", type: "payment" });

      const shuffled = list.sort(() => 0.5 - Math.random());
      setEvents(shuffled);
    }).catch(() => {
      setEvents([
        { text: "⚡ Ravi just registered from Delhi!", type: "register" },
        { text: "🔥 New Campaign: Titan launched 'Ultimate Sportswear Drive'", type: "campaign" },
        { text: "🤝 Ananya just got selected for Nykaa's Summer Glowup Reel", type: "collab" },
        { text: "✅ Karan just got his payment of ₹35,000 released net of fees!", type: "payment" },
        { text: "⚡ Priya Sharma just registered from Mumbai!", type: "register" }
      ]);
    });
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events]);

  if (!events.length) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--violet)]/10 border border-[var(--violet)]/20 text-sm" data-testid="hero-live-pill">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[var(--text-primary)]/90">Loading active network events...</span>
      </span>
    );
  }

  const activeEvent = events[index];

  return (
    <div className="h-12 flex items-center justify-center relative select-none max-w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--violet)]/12 border border-[var(--violet)]/20 text-xs sm:text-sm shadow-[0_4px_12px_rgba(124,92,255,0.15)] max-w-[90vw] sm:max-w-xl text-center truncate"
          data-testid="hero-live-pill"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[var(--text-primary)]/95 font-medium tracking-normal font-sans text-xs sm:text-sm block truncate">
            {activeEvent.text}
          </span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ====================== HERO ====================== */
function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[var(--violet)]/20 blur-[120px]"></div>
        <div className="absolute top-60 left-1/4 w-[300px] h-[300px] rounded-full bg-[var(--violet)]/15 blur-[100px]"></div>
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full bg-[#9D7CFF]/10 blur-[100px]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28 text-center">
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="inline-block">
          <LiveActivityPill />
        </motion.div>

        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7, delay:0.1}} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-8 tracking-tighter leading-[1.1] md:leading-[1]">
          India's Most Transparent
        </motion.h1>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7, delay:0.2}} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-3 tracking-tighter leading-[1.1] md:leading-[1]">
          <span className="bg-gradient-to-r from-[#9D7CFF] via-[#B19CFF] to-[#7C5CFF] bg-clip-text text-transparent">Influencer Marketplace</span>
        </motion.h1>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4,duration:0.6}} className="mt-10 italic text-lg md:text-xl text-[var(--text-primary)]/65">
          Know the Price, Trust the Data, Measure the Result.
        </motion.p>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.5}} className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/explore" data-testid="hero-explore-cta" className="btn-secondary">Explore Creators</Link>
          <Link to="/signup" data-testid="hero-signup-cta" className="btn-primary">Get Started Free <ArrowRight size={16}/></Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ====================== STATS BAR ====================== */
function StatsBar() {
  const items = [
    { n: "140K+", l: "Verified Creators" },
    { n: "500+", l: "Cities Covered" },
    { n: "25+", l: "Categories" },
    { n: "10K+", l: "Brand Collaborations" },
  ];
  return (
    <section className="relative">
      <div className="border-y border-[var(--violet)]/20 bg-[var(--violet)]/[0.06] backdrop-blur" data-testid="stats-bar">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((s, i) => (
            <motion.div key={s.l} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07, duration:0.4}}>
              <div className="font-display text-4xl md:text-5xl tracking-tighter">{s.n}</div>
              <div className="text-sm text-[var(--text-primary)]/55 mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================== WHAT MAKES YBEX DIFFERENT ====================== */
function WhatMakesUsDifferent() {
  const usps = [
    { num: "USP 01", color: "violet",  icon: <IndianRupee size={22}/>, t: "Rate Card Transparency",
      d: "Every creator's pricing is publicly visible — Reels, Stories, YouTube Videos. Know the cost before you connect. Zero negotiation surprises." },
    { num: "USP 02", color: "emerald", icon: <TrendingUp size={22}/>, t: "Verified Performance Data",
      d: "Real engagement scores, average views from the last 30 days, and AI-powered fake follower detection. Invest only where ROI is proven." },
    { num: "USP 03", color: "sky",     icon: <Map size={22}/>, t: "Bharat-First Creator Network",
      d: "Beyond Delhi and Mumbai — discover verified creators from Lucknow, Jaipur, Patna, Indore and 500+ cities across India." },
    { num: "USP 04", color: "amber",   icon: <Shield size={22}/>, t: "Performance Rank System",
      d: "After every campaign, each creator receives a score. A leaderboard ranks all collaborators. Your best performer gets an automatic re-collaboration alert." },
  ];
  const colors = {
    violet:  { bg: "bg-[var(--violet)]/12 border-[var(--violet)]/20", text: "text-[var(--violet)]" },
    emerald: { bg: "bg-emerald-500/12 border-emerald-500/35", text: "text-emerald-400" },
    sky:     { bg: "bg-sky-500/12 border-sky-500/35", text: "text-sky-400" },
    amber:   { bg: "bg-amber-500/12 border-amber-500/35", text: "text-amber-400" },
  };

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-28" data-testid="usps-section">
      <div className="text-center max-w-2xl mx-auto">
        <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter">What Makes Ybex Different</motion.h2>
        <p className="mt-5 text-[var(--text-primary)]/55">Four platform-exclusive features that no other Indian influencer marketplace offers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
        {usps.map((u, i) => {
          const c = colors[u.color];
          return (
            <motion.div key={u.num} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="card-dark min-h-[340px] flex flex-col" data-testid={`usp-${u.num.replace(/\s/g,'')}`}>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${c.bg} ${c.text}`}>{u.icon}</div>
              <div className={`label-mini mt-7 ${c.text}`} style={{color: undefined}}><span className={c.text}>{u.num}</span></div>
              <h3 className="font-semibold text-lg mt-2 leading-snug">{u.t}</h3>
              <p className="text-sm text-[var(--text-primary)]/55 mt-3 leading-relaxed">{u.d}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ====================== BRANDS MARQUEE ====================== */
function BrandsMarquee() {
  return (
    <section className="py-16 overflow-hidden border-t border-foreground/5" data-testid="brands-marquee">
      <p className="text-center label-mini text-[var(--text-tertiary)]">Trusted by Brands Across India</p>
      <div className="mt-10 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        <div className="flex marquee-track w-max">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-display text-2xl md:text-3xl mx-8 text-[var(--text-primary)]/35 hover:text-[var(--text-primary)]/80 transition-colors flex-shrink-0">{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================== PERFORMANCE RANK SHOWCASE ====================== */
function PerformanceRankShowcase() {
  const rows = [
    { rank: 1, name: "Priya Sharma", city: "Mumbai", promised: "50K", delivered: "73.2K", tier: "PLATINUM", score: 94, color: "from-[#7C5CFF]/35 to-[#5B3EE0]/35", border: "border-[var(--violet)]/20", text: "text-[#B19CFF]" },
    { rank: 2, name: "Rohan Verma", city: "Bangalore", promised: "40K", delivered: "38.5K", tier: "GOLD", score: 79, color: "from-amber-500/25 to-orange-500/25", border: "border-amber-400/40", text: "text-amber-400" },
    { rank: 3, name: "Anjali Singh", city: "Delhi", promised: "80K", delivered: "61K", tier: "SILVER", score: 62, color: "from-slate-400/15 to-slate-500/15", border: "border-foreground/15", text: "text-[var(--text-secondary)]" },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 py-24" data-testid="performance-showcase">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest font-semibold">
          <Award size={14}/> Exclusive to Ybex — USP 04
        </span>
        <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter mt-6">
          Performance Rank System
        </motion.h2>
        <p className="text-[var(--text-primary)]/55 mt-5 max-w-xl mx-auto">After every campaign closes, each creator receives an objective score. A leaderboard ranks all collaborators by ROI delivered.</p>
      </div>

      <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card-dark mt-14 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400"/>
            <span className="font-semibold">Swiggy — Diwali Campaign Leaderboard</span>
          </div>
          <span className="text-xs text-[var(--text-primary)]/45">5 Creators · Campaign Closed</span>
        </div>

        <div className="divide-y divide-white/5">
          {rows.map((r) => {
            const medalIcon = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉";
            return (
              <div key={r.rank} className={`px-6 py-5 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-4 sm:gap-3 ${r.rank===1 ? "bg-[var(--violet)]/[0.06]" : ""}`}>
                <div className="flex items-center gap-3 sm:col-span-1">
                  <span className="text-2xl">{medalIcon}</span>
                  <span className="sm:hidden font-display text-sm font-bold text-[var(--text-tertiary)]">Rank #{r.rank}</span>
                </div>
                
                <div className="sm:col-span-5 w-full">
                  <div className="font-semibold text-base sm:text-sm">{r.name}</div>
                  <div className="text-xs text-[var(--text-primary)]/45">{r.city} · Swiggy Diwali</div>
                </div>

                <div className="flex justify-between sm:justify-start w-full sm:w-auto sm:col-span-2 gap-2 mt-1 sm:mt-0">
                  <div className="text-left sm:text-right w-1/2 sm:w-full">
                    <div className="text-xs text-[var(--text-primary)]/45">Promised</div>
                    <div className="font-mono font-semibold text-xs sm:text-sm">{r.promised} views</div>
                  </div>
                  <div className="text-right sm:text-right w-1/2 sm:w-full">
                    <div className="text-xs text-[var(--text-primary)]/45">Delivered</div>
                    <div className="font-mono font-semibold text-xs sm:text-sm text-emerald-400">{r.delivered} views</div>
                  </div>
                </div>

                <div className="sm:col-span-4 w-full flex sm:justify-end mt-2 sm:mt-0">
                  <span className={`inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r ${r.color} border ${r.border} ${r.text} text-xs font-bold tracking-wider`}>
                    {r.tier} · {r.score}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5 md:p-6 flex items-start md:items-center gap-4 flex-col md:flex-row" data-testid="recollab-alert">
        <div className="text-3xl flex-shrink-0">🔔</div>
        <div className="flex-1">
          <div className="font-semibold text-emerald-400 mb-1">Automatic Re-Collaboration Alert</div>
          <p className="text-sm text-[var(--text-secondary)]">
            Priya Sharma scored 94/100 in the Swiggy campaign. Your ₹12,000 investment generated 73,200 views at ₹0.16 per view. She is your best performer — would you like to re-collaborate?
          </p>
        </div>
        <Link to="/leaderboard" data-testid="recollab-cta" className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center gap-2 transition-colors flex-shrink-0">
          Re-Collaborate <ArrowRight size={14}/>
        </Link>
      </motion.div>
    </section>
  );
}

/* ====================== HOW IT WORKS ====================== */
function HowItWorks() {
  const steps = [
    { num: "STEP 01", color: "text-[var(--violet)]", icon: <Search size={32}/>, t: "Discover Creators",
      d: "Use 24 smart filters — category, city, budget, engagement rate, and platform. Every creator's rate card is already visible before you connect." },
    { num: "STEP 02", color: "text-sky-400", icon: <Handshake size={32}/>, t: "Connect & Collaborate",
      d: "Send a connection request, request a quote, or post a campaign brief. Creators respond directly — no middlemen, zero hidden fees." },
    { num: "STEP 03", color: "text-emerald-400", icon: <LineChart size={32}/>, t: "Track ROI",
      d: "The Performance Rank System automatically scores every creator after a campaign. Your top performers receive instant re-collaboration suggestions." },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24" data-testid="how-it-works">
      <div className="text-center">
        <motion.h2 initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter">How It Works</motion.h2>
        <p className="text-[var(--text-primary)]/55 mt-5">Three steps to your first successful influencer collaboration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {steps.map((s, i) => (
          <motion.div key={s.num} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="text-center px-4">
            <div className={`w-16 h-16 rounded-2xl bg-foreground/5 border border-[var(--border-default)] mx-auto flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div className={`label-mini mt-6 ${s.color}`}>{s.num}</div>
            <h3 className="font-display text-2xl mt-2">{s.t}</h3>
            <p className="text-sm text-[var(--text-primary)]/55 mt-4 leading-relaxed">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ====================== FINAL CTA ====================== */
function FinalCTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 pb-24">
      <div className="relative card-elevated p-10 md:p-16 text-center overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[var(--violet)]/25 blur-[120px] pointer-events-none"></div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--violet)]/10 border border-[var(--violet)]/20 text-sm">
            <Sparkles size={14} className="text-[var(--violet)]"/> Ready to begin?
          </span>
          <h2 className="font-display text-4xl md:text-6xl mt-6 tracking-tighter">
            The most transparent way<br/>to <span className="bg-gradient-to-r from-[#9D7CFF] to-[#7C5CFF] bg-clip-text text-transparent">collaborate in India</span>
          </h2>
          <p className="mt-5 text-[var(--text-primary)]/60 max-w-xl mx-auto">Public rate cards. Verified data. Performance-tracked ROI. Built for serious creators and serious brands.</p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/signup?role=creator" data-testid="final-creator-cta" className="btn-secondary">I'm a Creator</Link>
            <Link to="/signup?role=brand" data-testid="final-brand-cta" className="btn-primary">I'm a Brand <ArrowRight size={16}/></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================== LANDING FOOTER ====================== */
function LandingFooter() {
  return (
    <footer className="relative border-t border-foreground/5 bg-[var(--bg-base)] pt-20 pb-12 overflow-hidden z-20">
      {/* Huge background watermark matching competitor layout but styled in our premium violet tone */}
      <div className="absolute bottom-[-1.5rem] lg:bottom-[-2.5rem] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
        <span className="font-display text-[15vw] font-black text-[var(--text-primary)]/[0.03] uppercase tracking-[0.16em] leading-none select-none filter blur-[0.5px]">
          YBEX
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2">
              <YbexLogo className="h-7" />
            </Link>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mt-2">
              Ybex is an OPEN Professional Network for Creators, Celebrities, Talent Managers and Brands. Connect and collaborate freely.
            </p>
            
            {/* Social Icons with elegant hover effects */}
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: <Instagram size={15} />, url: "https://instagram.com/ybex.in" },
                { icon: <Facebook size={15} />, url: "https://facebook.com/ybexmedia" },
                { icon: <Youtube size={15} />, url: "https://youtube.com/@ybexmedia" },
                { icon: <Linkedin size={15} />, url: "https://linkedin.com/company/ybexmedia" }
              ].map((soc, idx) => (
                <a 
                  key={idx} 
                  href={soc.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-foreground/5 border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#D9F111] hover:border-[#D9F111]/45 hover:bg-foreground/[0.08] transition-all transform hover:scale-105"
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore Platform Column */}
          <div className="md:col-span-3 col-span-1">
            <h4 className="text-xs font-black text-[var(--text-primary)]/90 uppercase tracking-widest mb-4 font-display">Explore Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Creator Discovery</Link></li>
              <li><Link to="/signup?role=brand" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">D2C Alliances</Link></li>
              <li><Link to="/ugc-orders" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">UGC Campaign Briefs <span className="text-[8px] bg-[#D9F111]/15 text-[#D9F111] px-1.5 py-0.5 rounded font-black uppercase">Live</span></Link></li>
              <li><Link to="/explore" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Premium Rate Cards</Link></li>
            </ul>
          </div>

          {/* Network Options Column */}
          <div className="md:col-span-2 col-span-1">
            <h4 className="text-xs font-black text-[var(--text-primary)]/90 uppercase tracking-widest mb-4 font-display">Our Network</h4>
            <ul className="space-y-3">
              <li><Link to="/signup?role=brand" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Talent Agencies</Link></li>
              <li><Link to="/signup?role=brand" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Brand Managers</Link></li>
              <li><Link to="/signup?role=creator" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Verified Creators</Link></li>
              <li><Link to="/explore" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold text-[#D9F111]">Barter Directory</Link></li>
            </ul>
          </div>

          {/* Resource & Safety Column */}
          <div className="md:col-span-3 col-span-1">
            <h4 className="text-xs font-black text-[var(--text-primary)]/90 uppercase tracking-widest mb-4 font-display">Resources &amp; Safety</h4>
            <ul className="space-y-3">
              <li><Link to="/info/about" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Creator Handbooks</Link></li>
              <li><Link to="/info/careers" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">Careers <span className="text-[7px] border border-blue-500/40 text-blue-400 px-1 py-0.5 rounded font-black uppercase leading-none">Join Us</span></Link></li>
              <li><Link to="/privacy-policy" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Escrow Protection</Link></li>
              <li><Link to="/info/terms" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright and status */}
        <div className="border-t border-foreground/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-[10px] tracking-wider text-[var(--text-primary)]/35 font-medium">
          <div className="uppercase">
            DATRUX SYSTEMS PVT. LIMITED &copy; 2026. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-2 select-none uppercase text-[var(--text-secondary)] font-bold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Ybex Cloud Network Operational</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-[var(--text-primary)] transition-colors uppercase">Privacy Rules</Link>
            <span>·</span>
            <a href="https://ybexmedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors uppercase font-bold text-[#D9F111]">YBEXMEDIA.COM</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
