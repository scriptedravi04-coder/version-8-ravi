import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, CheckCircle2, UserCircle, Search, Shield, 
  MessageSquare, FileText, Video, UploadCloud, 
  Share2, BarChart2, IndianRupee, FileCheck, Banknote, HelpCircle
} from "lucide-react";

const phases = [
  {
    title: "Profile & Discovery",
    id: "phase-1",
    color: "from-blue-600/20 to-purple-600/20",
    borderColor: "border-blue-500/30",
    steps: [
      {
        num: 1,
        title: "Profile Complete Karo",
        icon: <UserCircle size={24} className="text-blue-400" />,
        points: [
          "Niche select karo (Fashion / Tech / Food / Lifestyle etc.)",
          "Follower count accurately daalo (fake mat daalna — brands verify karte hain)",
          "Rate card set karo — per post / per reel / per story ka rate",
          "Instagram, YouTube, TikTok links connect karo",
          "Past work / portfolio add karo (at least 3-5 examples)",
          "Bio mein specialization likho"
        ],
        extra: "Incomplete profile = less visibility | Pro tip: Professional photo lagao"
      },
      {
        num: 2,
        title: "Campaign Explore Karo",
        icon: <Search size={24} className="text-blue-400" />,
        points: [
          "Home feed ya Explore tab pe campaigns dikhenge",
          "Filter karo — Category, Budget Range, Deadline",
          "Campaign card pe click karo — full detail dekho",
          "Brand ka naam, followers requirement, budget, deliverables sab check karo"
        ],
        extra: "Niche Match zaroori"
      }
    ]
  },
  {
    title: "Eligibility & Application",
    id: "phase-2",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    callout: {
      type: 'decision',
      title: "Decision — Kya Tum Eligible Ho?",
      left: { title: "Haan — Apply Karo", desc: "Followers match, niche match, rate range acceptable — aage badhte hain" },
      right: { title: "Nahi — Skip Karo", desc: "Followers kam hain ya niche alag hai — is campaign pe mat jao, dusra dhoondho" }
    },
    steps: [
      {
        num: 3,
        title: "Permissions — App Ye Maangega",
        icon: <Shield size={24} className="text-amber-400" />,
        points: [
          "Camera — Content shoot karne ke liye (video/photo)",
          "Media / Gallery Access — Existing content upload karne ke liye",
          "Microphone / Audio Record — Voiceover ya reel audio",
          "Notifications — Brand reply, payment alerts ke liye",
          "File Storage — Draft save aur upload karne ke liye"
        ],
        extra: "Sab permissions Allow karo — warna upload nahi hoga"
      }
    ]
  },
  {
    title: "Brand Response & Chat",
    id: "phase-3",
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    steps: [
      {
        num: 4,
        title: "Proposal Submit Karo",
        icon: <FileText size={24} className="text-pink-400" />,
        points: [
          "Apna rate quote karo — jo campaign budget ke andar ho ya slightly above",
          "Brand ko ek short pitch likho — \"Main aapke product ko aise promote karunga...\"",
          "Past work / portfolio link attach karo",
          "Estimated delivery date daalo",
          "Koi special value add mention karo — e.g. \"Story + Reel dono dunga\""
        ],
        extra: "Generic proposal mat daalo — personalize karo brand ke liye | Strong pitch = Higher chance of selection"
      }
    ],
    callout: {
      type: 'decision',
      title: "Brand Decision Aaya",
      left: { title: "Reject", desc: "Notification aayega. Don't worry — reapply on other campaigns. Profile improve karo." },
      right: { title: "Shortlisted!", desc: "Chat unlock ho jaata hai. Brand se direct baat ho sakti hai ab." }
    },
    postSteps: [
      {
        num: 5,
        title: "Chat — Negotiate Karo",
        icon: <MessageSquare size={24} className="text-pink-400" />,
        points: [
          "Rate Negotiate: \"Main ₹8000 pe kar sakta hoon — isme 1 Reel + 2 Stories included hain\"",
          "Deliverables Confirm: Exactly kya chahiye — duration, format, aspect ratio",
          "Deadline Fix: \"Main 5 din mein draft dunga, aur 2 din mein final\"",
          "Revisions Count: Pehle bol do — \"2 free revisions, uske baad charges honge\"",
          "Posting Date: Kab live karna hai confirm karo",
          "Usage Rights: Brand content reuse kar sakta hai ya nahi — ye bhi poocho",
          "FYI: Sab chat mein hi hoga — in-app only, WhatsApp nahi"
        ],
        extra: "Koi bhi deal verbally mat karo — chat pe hi sab likhwao | Cashfree se payment hogi — bank details ready rakho"
      }
    ]
  },
  {
    title: "Content Creation & Submission",
    id: "phase-4",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    steps: [
      {
        num: 6,
        title: "Deal Confirm — Agreement Sign",
        icon: <CheckCircle2 size={24} className="text-emerald-400" />,
        points: [
          "In-app contract / agreement generate hoga",
          "Amount, deliverables, deadline, revision count sab mention hoga",
          "Dono sides — creator aur brand — digitally sign karte hain",
          "Payment terms bhi yahan hote hain — e.g. 50% advance, 50% on delivery"
        ],
        extra: "Agreement ke baad koi bhi changes ke liye brand se chat pe request karo"
      },
      {
        num: 7,
        title: "Content Banao",
        icon: <Video size={24} className="text-emerald-400" />,
        points: [
          "Brand ki brief / guidelines carefully padho — script, talking points, don'ts",
          "Video shoot karo — agreed format mein (Reel = 30-60 sec, YouTube = longer)",
          "Brand ka product clearly dikhao — logo, packaging",
          "Mandatory disclaimers include karo (#ad, #sponsored)",
          "Caption draft bhi ready karo brand ke hisaab se",
          "Agar voiceover chahiye — mic se record karo (app permission use karega)"
        ],
        extra: "Bina approval ke live mat karo | Aspect ratio aur resolution check karo pehle"
      },
      {
        num: 8,
        title: "Draft App Pe Upload Karo",
        icon: <UploadCloud size={24} className="text-emerald-400" />,
        points: [
          "App mein campaign section pe jao → \"Submit Draft\" click karo",
          "Video file upload karo (Gallery permission use hoga)",
          "Caption bhi paste karo",
          "Hashtags, mentions add karo",
          "Brand review ke liye submit — \"Draft Submitted\" status aayega"
        ],
        extra: "Status: Draft Submitted | Brand 24-48 hrs mein review karega"
      }
    ],
    callout: {
      type: 'decision',
      title: "Brand Draft Review",
      left: { title: "Revision Chahiye", desc: "Chat mein brand feedback dega. Changes karo aur resubmit karo. (Max agreed revisions tak)" },
      right: { title: "Approved!", desc: "Brand ne draft accept kar liya. Ab posting schedule confirm hoga." }
    }
  },
  {
    title: "Go Live & Proof",
    id: "phase-5",
    color: "from-indigo-500/20 to-cyan-500/20",
    borderColor: "border-indigo-500/30",
    steps: [
      {
        num: 9,
        title: "Content Go Live Karo",
        icon: <Share2 size={24} className="text-indigo-400" />,
        points: [
          "Agreed date aur time pe content post karo apne platform pe",
          "Caption, hashtags, brand mention/tag sab add karo",
          "Post URL / link app mein submit karo as proof",
          "Story bhi share karo agar agreement mein tha"
        ],
        extra: "Live hone ke baad link app mein daalo"
      },
      {
        num: 10,
        title: "Performance Proof Submit Karo",
        icon: <BarChart2 size={24} className="text-indigo-400" />,
        points: [
          "24-48 hrs baad — post ka analytics screenshot lo",
          "Views, Likes, Reach, Impressions — sab capture karo",
          "App mein \"Submit Report\" section mein upload karo",
          "Ye brand ke liye proof hai — payment release iske baad hoti hai",
          "Agar brand ne reach target diya tha — confirm karo ki achieve hua ya nahi"
        ],
        extra: "Proof submit kiye bina payment hold hogi | Instagram Insights screenshot — Stories ke 24 hrs ke andar lo"
      }
    ]
  },
  {
    title: "Payment & Invoice",
    id: "phase-6",
    color: "from-[#7C3AED]/20 to-[#9D7CFF]/20",
    borderColor: "border-[#7C3AED]/30",
    steps: [
      {
        num: 11,
        title: "Payment Request / Milestone Mark",
        icon: <IndianRupee size={24} className="text-[var(--violet)]" />,
        points: [
          "Campaign section mein \"Mark as Complete\" ya \"Request Payment\" click karo",
          "Brand ko notification jayega ki creator ne deliver kar diya",
          "Brand payment approve karega — usually 3-7 business days",
          "Agar brand delay kare — chat mein politely follow up karo",
          "Dispute section bhi hota hai — agar brand unfairly hold kare"
        ],
        extra: "Agar 7 din mein payment nahi — app support contact karo"
      },
      {
        num: 12,
        title: "Invoice Auto-Generate",
        icon: <FileCheck size={24} className="text-[var(--violet)]" />,
        points: [
          "App automatically invoice banata hai — Cashfree backend se",
          "Invoice mein hoga: Creator Name, Brand Name, Campaign Name, Amount, GST (agar applicable), Date",
          "Invoice download kar sako PDF mein",
          "GST registered ho toh GSTIN add karo profile mein pehle se",
          "TDS bhi deduct ho sakti hai — 10% agar payment ₹30,000+ se zyada ho"
        ],
        extra: "Invoice save karo — tax filing ke liye kaam aayega | TDS applicable agar amount bada ho"
      },
      {
        num: 13,
        title: "Payment Processing — Cashfree Gateway",
        icon: <Banknote size={24} className="text-[var(--violet)]" />,
        points: [
          "Gateway: Cashfree (confirmed from APK)",
          "Methods: UPI, Direct Bank Transfer, Amazon Pay",
          "Bank account pehle se verified hona chahiye app mein",
          "Amount: Agreed amount minus platform fee (Influish ka cut ~10-15% hota hai usually)",
          "Payment Session ID generate hogi internally — track karne ke liye",
          "UPI se fastest — 1-2 hrs. Bank transfer — 1-3 business days"
        ],
        extra: "Platform Fee pehle confirm karo — net amount pata chalega | UPI fastest payment method hai"
      },
      {
        num: 14,
        title: "Payment Received — Confirm Karo",
        icon: <CheckCircle2 size={24} className="text-emerald-400" />,
        points: [
          "Notification aayega — \"₹XXXX credited to your account\"",
          "App mein transaction history check karo",
          "Bank statement se match karo",
          "Final invoice download karo PDF mein",
          "Campaign \"Completed\" mark ho jaayega"
        ],
        extra: "Transaction ID save karo"
      }
    ]
  }
];

export default function CreatorCampaignFlow() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[var(--violet)]/30 font-sans pb-24">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-[var(--violet)]/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 relative z-10 pt-12 md:pt-20">
        
        {/* Navigation */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-[#B19CFF]">
            Influish — Creator Campaign Flow
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium">
            Starting se Leke Payment + Invoice Tak — Poora Process
          </p>
        </div>

        {/* Dynamic Phases */}
        <div className="space-y-16">
          {phases.map((phase, pIdx) => (
            <div key={phase.id} className="relative">
              
              {/* Phase Header */}
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${phase.borderColor} bg-gradient-to-r ${phase.color} mb-8 backdrop-blur-md`}>
                <span className="text-xs uppercase tracking-widest font-black opacity-80">PHASE {pIdx + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                <span className="text-sm font-bold">{phase.title}</span>
              </div>

              {/* Callout (if any before steps) */}
              {phase.callout && !phase.postSteps && (
                <DecisionBox callout={phase.callout} />
              )}

              {/* Steps */}
              <div className="space-y-6 lg:ml-4">
                {phase.steps.map((step, sIdx) => (
                  <StepCard key={step.num} step={step} isLast={sIdx === phase.steps.length - 1 && !phase.callout && pIdx === phases.length - 1} />
                ))}
              </div>

              {/* Mid-Phase Callout */}
              {phase.callout && phase.postSteps && (
                <div className="my-8">
                  <DecisionBox callout={phase.callout} />
                </div>
              )}

              {/* Post Steps */}
              {phase.postSteps && (
                <div className="space-y-6 lg:ml-4 mt-8">
                  {phase.postSteps.map((step) => (
                    <StepCard key={step.num} step={step} />
                  ))}
                </div>
              )}

            </div>
          ))}

          {/* Success Banner */}
          <div className="mt-16 bg-gradient-to-br from-emerald-900/40 to-[#0A1A14] border border-emerald-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-emerald-400" />
             </div>
             <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-6">Campaign Successfully Complete!</h2>
             
             <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-emerald-100/80 font-medium mb-8">
               <span>Brand ko rating do</span>
               <span className="hidden sm:inline opacity-30">|</span>
               <span>Portfolio mein add karo</span>
               <span className="hidden sm:inline opacity-30">|</span>
               <span>Invoice save karo</span>
             </div>

             <div className="inline-block bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-6 py-3 text-sm text-emerald-200">
               Next campaign apply karo — ab experience hai, proposal aur strong hoga!
             </div>
          </div>

          {/* Quick Ref */}
          <div className="mt-12 bg-[#161622] rounded-3xl p-8 border border-[var(--border-default)]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
               <HelpCircle size={20} className="text-[var(--violet)]" />
               Quick Reference — Important Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Profile complete hona zaroori</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Proposal personalize karo</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Bina approval ke live mat karo</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Invoice download karke save karo</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Revision count pehle fix karo</li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Sab chat pe hi karo — no WhatsApp</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Agreement ke baad kaam shuru karo</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Analytics proof submit karo</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> Cashfree se UPI/Bank payment aata hai</li>
                <li className="flex items-start gap-2"><span className="text-[var(--violet)] font-bold">·</span> TDS ₹30k+ pe applicable hai</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StepCard({ step }) {
  return (
    <div className="relative pl-6 md:pl-10 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[26px] top-[40px] bottom-[-20px] w-px bg-[var(--bg-elevated)] hidden md:block"></div>
      
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 hover:border-[var(--border-default)] transition-colors group">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Number & Icon */}
          <div className="flex-shrink-0 flex items-center md:items-start gap-4 md:flex-col md:w-12">
            <div className="w-10 h-10 rounded-full bg-[#222230] text-lg font-display font-black flex items-center justify-center text-[var(--text-primary)]/80 border border-[var(--border-default)] group-hover:bg-[var(--violet)] group-hover:border-[#7C3AED] transition-all">
              {step.num}
            </div>
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-[var(--bg-elevated)] items-center justify-center">
              {step.icon}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-5">{step.title}</h3>
            <ul className="space-y-3 mb-6">
              {step.points.map((pt, i) => (
                <li key={i} className="text-[var(--text-secondary)] text-sm leading-relaxed flex items-start gap-3">
                  <span className="text-[var(--violet)] mt-1 shrink-0">{"→"}</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {step.extra && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 text-xs text-[#D9F111]/80 font-medium leading-relaxed flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:divide-x divide-white/10">
                {step.extra.split('|').map((part, index) => (
                   <span key={index} className={index > 0 ? "md:pl-4" : ""}>{part.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionBox({ callout }) {
  return (
    <div className="border border-amber-500/30 border-dashed rounded-3xl p-6 bg-amber-500/5 my-8">
      <h3 className="text-center font-bold text-amber-400 mb-6">{callout.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-emerald-500/20">
          <h4 className="font-bold text-emerald-400 mb-2">{callout.left.title}</h4>
          <p className="text-sm text-[var(--text-secondary)]">{callout.left.desc}</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-rose-500/20">
          <h4 className="font-bold text-rose-400 mb-2">{callout.right.title}</h4>
          <p className="text-sm text-[var(--text-secondary)]">{callout.right.desc}</p>
        </div>
      </div>
    </div>
  );
}
