import React, { useState, useEffect, useRef } from "react";
import { Send, Upload, FileText, FileSignature, CheckCircle, Info, MoreVertical, MessageCircle, Mail, MessageSquare, Search, ShieldAlert, Award, Lock, ShieldCheck, BarChart3, Handshake, Check, Sparkles, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { showSecurityWarning } from "./SecurityWarningToast";
import SendBrief from "./SendBrief";
import BrandAgreement from "./BrandAgreement";
import AgreementSign from "./AgreementSign";
import DealInfoPanel from "./DealInfoPanel";
import NegotiationTable from "./NegotiationTable";
import BurgerMenuSupport from "./BurgerMenuSupport";
import SafetyModal from "./SafetyModal";
import CampaignAnalytics from "./CampaignAnalytics";
import { io } from "socket.io-client";

export default function ChatBox({ thread, user, onlineUsers = [] }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showBrandAgreeModal, setShowBrandAgreeModal] = useState(false);
  const [showCreatorAgreeModal, setShowCreatorAgreeModal] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showNegotiationTable, setShowNegotiationTable] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [inputMode, setInputMode] = useState("chat");
  const [offerAmount, setOfferAmount] = useState("");

  // Custom fetch to update thread object locally if we don't have socket updates
  const [localThread, setLocalThread] = useState(thread);
  const [isPriceAccepted, setIsPriceAccepted] = useState(false);

  const isBrand = user?.role === 'brand' || user?.user_type === 'brand';
  
  const currentThread = localThread || thread;
  const isTermsAccepted = currentThread ? (isBrand ? currentThread.terms_accepted_brand : currentThread.terms_accepted_creator) : false;
  const isAgreementSigned = currentThread ? (currentThread.agreement_signed_brand && currentThread.agreement_signed_creator) : false;
  const isDealFixed = currentThread ? (currentThread.status !== 'NEGOTIATING' && (currentThread.agreed_amount > 0 || currentThread.status === 'ACTIVE')) : false;

  const showTabs = !currentThread?.is_ugc && !isDealFixed && currentThread?.flow_state !== 'APPROVED' && currentThread?.flow_state !== 'AI_AGREEMENT_READY';
  const effectiveInputMode = showTabs ? inputMode : "chat";

  // Sponsorship and Contract Negotiation states
  const [isNegotiatingFee, setIsNegotiatingFee] = useState(false);
  const [counterAmountInput, setCounterAmountInput] = useState("");
  const [flowLoading, setFlowLoading] = useState(false);

  // OTP Signature and Inline Negotiation States
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isNegotiatingInline, setIsNegotiatingInline] = useState(false);
  const [counterAmountInline, setCounterAmountInline] = useState("");



  useEffect(() => {
    setLocalThread(thread);
    if (!thread) return;

    // Check safety acceptance from localStorage for this specific user + thread
    const acceptedKey = `safety_accepted_${user?.user_id || user?.id || 'anon'}_${thread.id}`;
    const accepted = localStorage.getItem(acceptedKey) === 'true';
    setSafetyAccepted(accepted);
    if (!accepted) {
      setShowSafetyModal(true);
    }

    loadMessages();

    // Setup active WebSocket connection
    const socket = io(window.location.origin, {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      socket.emit("register_user", user?.user_id || user?.id);
      socket.emit("join_room", thread.id);
    });

    socket.on("new_message", (newMessage) => {
      if (newMessage.thread_id === thread.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    const interval = setInterval(() => {
      loadMessages();
      refreshThread();
    }, 3000);

    return () => {
      socket.emit("leave_room", thread.id);
      socket.disconnect();
      clearInterval(interval);
    };
  }, [thread, user]);

  useEffect(() => {
    if (isAgreementSigned) {
      setInputMode(isDealFixed ? "chat" : "offer");
    }
  }, [isAgreementSigned, isDealFixed]);

  const handleAcceptSafety = () => {
    if (!thread) return;
    const acceptedKey = `safety_accepted_${user?.user_id || user?.id || 'anon'}_${thread.id}`;
    localStorage.setItem(acceptedKey, 'true');
    setSafetyAccepted(true);
    setShowSafetyModal(false);
    toast.success("Platform Safety Guidelines signed off successfully!");
  };

  useEffect(() => {
    // Just auto-scroll to bottom to ensure new messages are visible
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [messages, currentThread]);

  const refreshThread = async () => {
    if (!thread) return;
    try {
      const { data } = await api.get(`/chat/v2/threads/${thread.id}`);
      if (data) {
        setLocalThread(data);
      }
    } catch (err) {}
  };

  const loadMessages = async () => {
    if (!thread) return;
    try {
      const { data } = await api.get(`/chat/v2/threads/${thread.id}/messages`);
      if (data) {
        const filteredData = data.filter(m => m.content !== "⏳ Waiting for the other party to sign.");
        setMessages(prev => {
          if (prev.length === filteredData.length) return prev; // simple check to avoid unnecessary state updates
          return filteredData;
        });
      }
    } catch (err) {}
  };

  const handleSend = async () => {
    if (!text.trim() || !thread) return;
    const msg = text;
    setText("");
    try {
      const { data } = await api.post(`/chat/v2/threads/${thread.id}/messages`, {
        content: msg,
        message_type: 'text'
      });
      if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      if (err.response?.data?.blocked) {
        showSecurityWarning();
      } else {
        toast.error("Failed to send message: " + (err.response?.data?.error || err.message));
      }
    }
  };

  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)] relative overflow-hidden h-full">
        {/* Smooth, subtle grid background that softly fades out towards the edges */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[120%] h-[120%] absolute bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwIDBMMCAwaDB2MzBoMzBWMHptLTEgMXYyOEgxVjFoMjh6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_50%)] opacity-70"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center mt-[-40px]">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-[var(--bg-elevated)] rounded-3xl flex items-center justify-center rotate-[-6deg] shadow-xl border border-[var(--border-default)]">
               <Mail size={40} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-3xl flex items-center justify-center absolute top-0 left-0 rotate-[6deg] shadow-lg border border-[var(--border-default)] backdrop-blur-sm shadow-[0_0_40px_rgba(255,255,255,0.1)]">
               <Mail size={40} className="text-[var(--text-primary)]/80" />
            </div>
          </div>
          
          <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">No activity yet</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mb-8">
            You'll receive notifications for important updates and whenever you're mentioned on Ybex.
          </p>

          {isBrand ? (
            <Link to="/explore" className="px-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg">
               <Search size={18} /> Explore Creators
            </Link>
          ) : (
            <Link to="/campaigns" className="px-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg">
               <Search size={18} /> Explore Campaigns
            </Link>
          )}
        </div>
      </div>
    );
  }

  const partnerName = isBrand ? (thread.creator?.name || 'Creator') : (thread.brand?.name || 'Brand');
  const partnerPic = isBrand ? thread.creator?.profile_picture_url : thread.brand?.logo_url;
  
  const partnerId = isBrand ? thread?.creator_id : thread?.brand_id;
  const isPartnerOnline = partnerId && onlineUsers.includes(partnerId);

  const handleOfferComplete = () => {
    loadMessages();
    refreshThread();
    toast.success("Offer action completed");
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[var(--bg-base)] overflow-hidden">
      {/* Header */}
      <div className="h-20 px-6 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-card)]/90 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className={`relative w-10 h-10 rounded-full overflow-hidden shrink-0 border transition-all ${isPartnerOnline ? 'border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'border-[var(--border-default)]'}`}>
            {partnerPic ? <img src={partnerPic} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--bg-elevated)]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[var(--text-primary)] leading-tight">{partnerName}</h2>
              {isPartnerOnline ? (
                <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Offline
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{thread.campaigns?.title || 'Direct Deal'}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className="p-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] rounded-full text-[var(--violet)] hover:text-fuchsia-400 transition-all flex items-center justify-center border border-[var(--border-default)]"
            title="Campaign Analytics"
          >
            <BarChart3 size={20} />
          </button>
          <button 
            onClick={() => { setShowInfoPanel(!showInfoPanel); setShowNegotiationTable(false); }}
            className="p-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] rounded-full text-amber-500 hover:text-amber-400 transition-all flex items-center justify-center border border-[var(--border-default)]"
            title="Sponsorship Request Card"
          >
            <Award size={20} />
          </button>
          <BurgerMenuSupport thread={currentThread} user={user} />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main Panel Content Router */}
        <div className={`flex-1 overflow-y-auto bg-[var(--bg-base)] no-scrollbar relative flex flex-col`}>
        
        {/* Dynamic Sponsorship & Contract Flow Board (Plain Black & White Border Theme) */}
        {currentThread?.flow_state && currentThread?.flow_state === "AI_AGREEMENT_READY" && (
          <div className="mx-4 sm:mx-6 mt-4 p-5 sm:p-6 bg-[var(--bg-surface)]  text-[var(--text-primary)]  border border-[var(--border-strong)]  rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 z-20 font-sans">
            
            {/* Header / State Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[var(--border-strong)] ">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-[var(--violet)] text-white   flex items-center justify-center border border-[var(--border-strong)]  font-black text-sm">
                  §
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] ">Sponsorship Contract Agreement</h3>
                  <p className="text-[10px] text-slate-500 ">Formal partnership and campaign deliverables</p>
                </div>
              </div>

              {/* State Indicator */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {currentThread.flow_state === "REQUESTED" && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--violet)] text-white   border border-[var(--border-strong)]  px-2 py-0.5 rounded-none">
                    Awaiting Review
                  </span>
                )}
                {currentThread.flow_state === "APPROVED" && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--violet)] text-white   border border-[var(--border-strong)]  px-2 py-0.5 rounded-none">
                    Drafting Contract
                  </span>
                )}
                {currentThread.flow_state === "AI_AGREEMENT_READY" && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--violet)] text-white   border border-[var(--border-strong)]  px-2 py-0.5 rounded-none">
                    Ready to Sign
                  </span>
                )}
                {currentThread.flow_state === "NEGOTIATING_COUNTER" && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--violet)] text-white   border border-[var(--border-strong)]  px-2 py-0.5 rounded-none">
                    Counter Proposal Active
                  </span>
                )}
              </div>
            </div>

            {/* Project Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 rounded-none bg-[var(--bg-elevated)]  border border-[var(--border-strong)] ">
              <div>
                <p className="text-[9px] font-bold text-slate-500  uppercase tracking-wider mb-0.5">Campaign Name</p>
                <p className="text-xs font-bold truncate text-[var(--text-primary)] ">{currentThread.campaign_title || "Sourdough Campaign"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500  uppercase tracking-wider mb-0.5">Influencer</p>
                <p className="text-xs font-bold truncate text-[var(--text-primary)] ">{currentThread.creator_name || "Sarah Jenkins"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500  uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-xs font-bold truncate text-[var(--text-primary)] ">{currentThread.creator_location || "Mumbai, India"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500  uppercase tracking-wider mb-0.5">Due Date</p>
                <p className="text-xs font-bold truncate text-[var(--text-primary)] ">{currentThread.due_date || "2026-07-25"}</p>
              </div>
            </div>

            {/* Formal Agreement Body */}
            {(currentThread.flow_state === "AI_AGREEMENT_READY" || currentThread.flow_state === "NEGOTIATING_COUNTER") && (isBrand || isPriceAccepted) && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-500  uppercase tracking-wider mb-2">Contract Deliverables & Terms</p>
                <div className="bg-[var(--bg-surface)]  border border-[var(--border-strong)]  rounded-none p-4 text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap no-scrollbar text-[var(--text-primary)] ">
                  {currentThread.ai_generated_agreement || "Loading contract terms..."}
                </div>
              </div>
            )}

            {/* Compensation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-[var(--border-strong)] ">
              {/* Compensation Box */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-none bg-[var(--violet)] text-white border border-[var(--border-strong)] flex items-center justify-center shrink-0 font-bold text-xl">
                  ₹
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Brand Sponsorship Fee</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                      ₹{currentThread.amount_fixed?.toLocaleString('en-IN') || "25,000"}
                    </p>
                    {!isBrand && (
                      <div className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-1">
                        Note: A 2% platform fee will be deducted from this amount upon final payout.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions depending on role and status */}
              <div className="flex flex-wrap items-center gap-3">
                {flowLoading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] ">
                    <div className="w-4 h-4 border border-[var(--border-strong)]  border-t-transparent rounded-full animate-spin" />
                    Updating Contract...
                  </div>
                )}

                {!flowLoading && (
                  <>
                    {/* State: REQUESTED */}
                    {currentThread.flow_state === "REQUESTED" && (
                      isBrand ? (
                        <button
                          onClick={async () => {
                            setFlowLoading(true);
                            try {
                              await api.post(`/chat/v2/threads/${currentThread.id}/approve-request`);
                              toast.success("Campaign request approved! Agreement drafted.");
                              loadMessages();
                              refreshThread();
                            } catch (e) {
                              toast.error("Failed to approve request.");
                            } finally {
                              setFlowLoading(false);
                            }
                          }}
                          className="px-5 py-2.5 bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)]    font-bold text-xs transition-colors border border-[var(--border-strong)]  flex items-center gap-2 cursor-pointer rounded-none"
                        >
                          <CheckCircle size={14} /> Approve Campaign & Draft Contract
                        </button>
                      ) : (
                        <p className="text-xs text-slate-500  italic">Reviewing your campaign application. Brand will release official contract terms shortly.</p>
                      )
                    )}

                    {/* State: AI_AGREEMENT_READY */}
                    {currentThread.flow_state === "AI_AGREEMENT_READY" && (
                      !isBrand ? (
                        isNegotiatingFee ? (
                          <div className="flex items-center gap-2.5">
                            <input
                              type="number"
                              placeholder="Counter Amount"
                              value={counterAmountInput}
                              onChange={(e) => setCounterAmountInput(e.target.value)}
                              className="px-3 py-2 bg-[var(--bg-surface)]  border border-[var(--border-strong)]  text-xs text-[var(--text-primary)]  placeholder-slate-400 focus:outline-none w-32 rounded-none font-mono"
                            />
                            <button
                              onClick={async () => {
                                if (!counterAmountInput || Number(counterAmountInput) <= 0) {
                                  toast.error("Please enter a valid counter amount");
                                  return;
                                }
                                setFlowLoading(true);
                                try {
                                  await api.post(`/chat/v2/threads/${currentThread.id}/creator-negotiate`, {
                                    counter_amount: Number(counterAmountInput)
                                  });
                                  toast.success("Counter-offer proposed! Awaiting brand review.");
                                  setIsNegotiatingFee(false);
                                  setCounterAmountInput("");
                                  loadMessages();
                                  refreshThread();
                                } catch (e) {
                                  toast.error("Negotiation failed.");
                                } finally {
                                  setFlowLoading(false);
                                }
                              }}
                              className="px-4 py-2 bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)]    font-bold text-xs transition-all border border-[var(--border-strong)]  cursor-pointer rounded-none"
                            >
                              Submit Counter
                            </button>
                            <button
                              onClick={() => setIsNegotiatingFee(false)}
                              className="px-3 py-2 text-slate-500 hover:text-[var(--text-primary)]  text-xs transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 w-full">
                            {!isPriceAccepted ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setIsPriceAccepted(true)}
                                  className="px-5 py-2.5 bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)] font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer rounded-lg"
                                >
                                  <CheckCircle size={14} /> Accept Price & View Contract
                                </button>
                                <button
                                  onClick={() => setIsNegotiatingFee(true)}
                                  className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-default)] font-bold text-xs transition-colors border border-[var(--border-strong)] cursor-pointer rounded-lg"
                                >
                                  Negotiate
                                </button>
                              </div>
                            ) : (
                              /* OTP Signature Form or Sign-off Buttons */
                              showOtpForm ? (
                                <div className="p-6 border-2 border-[var(--violet)] bg-[var(--bg-surface)] w-full text-left rounded-2xl shadow-xl mt-4 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--violet)]"></div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-[var(--violet)]/10 text-[var(--violet)] flex items-center justify-center">
                                      <Lock size={16} />
                                    </div>
                                    <h4 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Authorized Signature</h4>
                                  </div>
                                  <p className="text-xs text-[var(--text-tertiary)] mb-6 pl-11">
                                    Securely verify your mobile number via SMS to legally execute this sponsorship contract.
                                  </p>
                                  <div className="flex flex-col gap-5 mb-6 pl-11">
                                    <div className="relative">
                                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Phone Number</label>
                                      <input 
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={otpPhoneNumber}
                                        onChange={e => setOtpPhoneNumber(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-strong)] text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)] focus:border-transparent transition-all shadow-inner font-medium"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">6-Digit OTP Code</label>
                                      <div className="flex gap-3">
                                        <input 
                                          type="text"
                                          maxLength={6}
                                          placeholder="••••••"
                                          value={otpCode}
                                          onChange={e => setOtpCode(e.target.value)}
                                          className="flex-1 px-4 py-3 bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-strong)] text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--violet)] focus:border-transparent font-mono rounded-xl transition-all text-center shadow-inner font-bold"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!otpPhoneNumber || otpPhoneNumber.trim().length < 8) {
                                              toast.error("Please enter a valid phone number first.");
                                              return;
                                            }
                                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                                            setGeneratedOtp(code);
                                            setOtpSent(true);
                                            toast.info(`[SMS Gateway] Verification code sent! Use code: ${code}`, {
                                              duration: 15000,
                                            });
                                          }}
                                          className="px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--border-default)] text-xs font-bold transition-colors rounded-xl cursor-pointer shrink-0 uppercase tracking-wider"
                                        >
                                          {otpSent ? "Resend OTP" : "Send OTP"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                     
                                  <div className="flex items-center gap-3 pl-11">
                                    <button
                                      onClick={async () => {
                                        if (!otpSent) {
                                          toast.error("Please click 'Send OTP' to request a verification code first.");
                                          return;
                                        }
                                        if (!otpCode || otpCode !== generatedOtp) {
                                          toast.error("Invalid OTP code. Please enter the correct code received in the SMS prompt.");
                                          return;
                                        }
                                        setFlowLoading(true);
                                        try {
                                          await api.post(`/chat/v2/threads/${currentThread.id}/creator-approve-agreement`);
                                          toast.success("Sponsorship contract legally executed with phone signature OTP!");
                                          setShowOtpForm(false);
                                          setOtpSent(false);
                                          setOtpCode("");
                                          setOtpPhoneNumber("");
                                          loadMessages();
                                          refreshThread();
                                        } catch (e) {
                                          toast.error("Failed to execute agreement.");
                                        } finally {
                                          setFlowLoading(false);
                                        }
                                      }}
                                      disabled={flowLoading}
                                      className="flex-1 py-3.5 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white font-bold text-sm tracking-wide transition-all rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle size={18} /> Execute Contract
                                    </button>
                                    <button
                                      onClick={() => setShowOtpForm(false)}
                                      className="px-6 py-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-bold text-sm transition-colors rounded-xl uppercase tracking-wider border border-transparent hover:border-[var(--border-default)]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      setShowOtpForm(true);
                                    }}
                                    className="px-5 py-2.5 bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)] font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer rounded-lg"
                                  >
                                    <CheckCircle size={14} /> Approve & Sign Contract
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )
                      ) : (
                        <p className="text-xs text-slate-500  italic">Agreement draft sent! Awaiting Creator sign-off or counter proposal.</p>
                      )
                    )}

                    {/* State: NEGOTIATING_COUNTER */}
                    {currentThread.flow_state === "NEGOTIATING_COUNTER" && (
                      isBrand ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="text-[10px] text-[var(--text-primary)]  font-bold">Creator Counter Proposal:</p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-[var(--text-primary)]  bg-[var(--bg-surface)]  border border-[var(--border-strong)]  px-3 py-1.5">
                              ₹ {currentThread.counter_amount?.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={async () => {
                                setFlowLoading(true);
                                try {
                                  await api.post(`/chat/v2/threads/${currentThread.id}/brand-accept-counter`);
                                  toast.success("Counter-offer accepted! sponsorship agreement updated.");
                                  loadMessages();
                                  refreshThread();
                                } catch (e) {
                                  toast.error("Failed to accept counter offer.");
                                } finally {
                                  setFlowLoading(false);
                                }
                              }}
                              className="px-4 py-2.5 bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)]    font-bold text-xs transition-colors border border-[var(--border-strong)]  cursor-pointer rounded-none"
                            >
                              Accept Counter Offer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs text-slate-500  italic">Counter proposal of ₹{currentThread.counter_amount?.toLocaleString('en-IN')} submitted.</p>
                          <p className="text-[10px] text-slate-500  font-medium">Awaiting Brand review...</p>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-end" ref={scrollRef}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-tertiary)]">
                <MessageSquare size={32} className="opacity-40 mb-3" />
                <p className="text-sm">No messages yet. Send a message to start conversing!</p>
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMine={msg.sender_role ? msg.sender_role === (isBrand ? 'brand' : 'creator') : msg.sender_id === user.user_id} 
                  isUserBrand={isBrand}
                  threadId={thread.id} 
                  campaignTitle={currentThread?.campaign_title || thread?.campaign_title || "Campaign"}
                  onActionComplete={handleOfferComplete}
                />
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} style={{ height: 1 }} />
        </div>
        </div> {/* Close Main Panel Content Router div */}
        
        {/* Persistent Input & Mode Controller Area */}
        <div className="bg-[var(--bg-card)] border-t border-[var(--border-default)] p-4 sm:p-5 shrink-0 z-10 w-full relative">
            {/* Mode Controls tabs: Chat & Offer Removed */}
            
            {/* Safety & Compliance Indicators */}
            {safetyAccepted ? (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar justify-center sm:justify-start max-w-4xl mx-auto">
                {!isBrand && currentThread.status === 'ACTIVE' && (
                  <button onClick={async () => {
                    await api.post(`/chat/v2/threads/${thread.id}/submit-content`, { content_url: "example.com" });
                    loadMessages();
                  }} className="whitespace-nowrap px-4 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] rounded-full text-xs font-bold flex items-center gap-2 transition-colors">
                    <Upload size={14} /> Submit Content Proof
                  </button>
                )}
                {isBrand && currentThread.status === 'CONTENT_SUBMITTED' && (
                  <button onClick={async () => {
                    await api.post(`/chat/v2/threads/${thread.id}/approve-content`);
                    loadMessages();
                  }} className="whitespace-nowrap px-4 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full text-xs font-bold flex items-center gap-2 transition-colors border border-green-500/30">
                    <CheckCircle size={14} /> Approve Content
                  </button>
                )}
                {isBrand && currentThread.status === 'APPROVED' && (
                  <button onClick={async () => {
                    await api.post(`/chat/v2/threads/${thread.id}/mark-complete`);
                    loadMessages();
                  }} className="whitespace-nowrap px-4 py-1.5 bg-[var(--violet)]/20 text-[var(--violet)] hover:bg-[var(--violet)]/30 rounded-full text-xs font-bold flex items-center gap-2 transition-colors border border-[var(--violet)]/30">
                    <CheckCircle size={14} /> Release Payment & Complete
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-4xl mx-auto backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                    <Lock size={18} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Campaign Dashboard Protected</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Please read and accept the official Ybex Safety Guidelines to release transactions.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSafetyModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 whitespace-nowrap shadow-sm"
                >
                  Review & Unlock
                </button>
              </div>
            )}

            {/* Tabs & Input Area */}
            <div className="max-w-4xl mx-auto w-full">
              {/* Tabs */}
              {showTabs && (
                <div className="flex bg-[var(--bg-card)] border-b border-[var(--border-default)] mb-2">
                  <button 
                    onClick={() => setInputMode("chat")}
                    className={`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                      ${effectiveInputMode === "chat" ? "text-[var(--violet)] border-b-2 border-[var(--violet)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}`}
                  >
                    <MessageCircle size={16} /> CHAT
                  </button>
                  <button 
                    onClick={() => { setInputMode("offer"); if (!offerAmount) setOfferAmount(currentThread?.amount_fixed || 3000); }}
                    className={`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                      ${effectiveInputMode === "offer" ? "text-blue-500 border-b-2 border-blue-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"}`}
                  >
                    <Handshake size={16} /> NEGOTIATE OFFER
                  </button>
                </div>
              )}

              {/* Content Area */}
              <div className="w-full">
                {effectiveInputMode === "chat" ? (
                  <div className="flex items-end gap-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-default)] p-2">
                    <button className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-elevated)] shrink-0">
                      <Upload size={20} />
                    </button>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none max-h-32 min-h-[44px] py-3 text-sm focus:outline-none"
                      rows={1}
                    />
                    <button 
                      disabled={!text.trim() || loading}
                      onClick={handleSend}
                      className={`p-3 shrink-0 rounded-full transition-colors flex items-center justify-center
                        ${(!text.trim()) ? 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] opacity-60' : (isBrand ? 'bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)]' : 'bg-[#D9F111] text-[var(--text-primary)] hover:bg-[#b8cc0e]')}`}
                    >
                      <Send size={18} className={text.trim() ? "ml-0.5" : ""} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-default)]">
                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(() => {
                        const basePrice = currentThread?.amount_fixed || 3000;
                        if (!isBrand) {
                          // Creator side: Suggest higher offers
                          if (basePrice <= 1000) {
                            return [basePrice, basePrice + 100, basePrice + 200, basePrice + 300, basePrice + 500];
                          } else if (basePrice <= 5000) {
                            const step = basePrice >= 3000 ? 1000 : 500;
                            return [basePrice, basePrice + step, basePrice + step * 2, basePrice + step * 3, basePrice + step * 4];
                          } else {
                            const step = Math.round((basePrice * 0.2) / 1000) * 1000 || 1000;
                            return [basePrice, basePrice + step, basePrice + step * 2, basePrice + step * 3, basePrice + step * 4];
                          }
                        } else {
                          // Brand side: Suggest lower offers
                          if (basePrice <= 1000) {
                            return [basePrice, Math.max(100, basePrice - 100), Math.max(100, basePrice - 200), Math.max(100, basePrice - 300), Math.max(100, basePrice - 400)];
                          } else if (basePrice <= 5000) {
                            const step = basePrice >= 3000 ? 1000 : 500;
                            return [basePrice, Math.max(100, basePrice - step), Math.max(100, basePrice - step * 2), Math.max(100, basePrice - step * 3), Math.max(100, basePrice - step * 4)];
                          } else {
                            const step = Math.round((basePrice * 0.2) / 1000) * 1000 || 1000;
                            return [basePrice, Math.max(100, basePrice - step), Math.max(100, basePrice - step * 2), Math.max(100, basePrice - step * 3), Math.max(100, basePrice - step * 4)];
                          }
                        }
                      })().map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setOfferAmount(amt)}
                          className="px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm"
                        >
                          ₹ {amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                    
                    {/* Amount Input */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center text-4xl font-black text-[var(--text-primary)] tracking-tight">
                        <span className="mr-2 text-[var(--text-secondary)]">₹</span>
                        <input 
                          type="number" 
                          className="bg-transparent border-none focus:ring-0 w-48 p-0 text-4xl font-black text-[var(--text-primary)] tracking-tight placeholder-[var(--text-tertiary)]"
                          value={offerAmount}
                          onChange={e => setOfferAmount(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      
                      <button
                        onClick={async () => {
                           // Send a special message
                           await api.post(`/chat/v2/threads/${thread.id}/offer`, {
                             amount: Number(offerAmount),
                             deliverables: ["Content creation", "Revisions"],
                             deadline: new Date(Date.now() + 7*86400*1000).toISOString(),
                             revision_count: 1,
                             breakdown: []
                           });
                           setOfferAmount("");
                           setInputMode("chat");
                           loadMessages();
                        }}
                        disabled={!offerAmount || loading}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                      >
                        Send Offer
                      </button>
                    </div>

                    {/* Feedback Box */}
                    {(() => {
                      const base = currentThread?.amount_fixed || 3000;
                      const val = Number(offerAmount);
                      let color = 'text-[var(--text-secondary)]';
                      let bg = 'bg-[var(--bg-surface)]';
                      let border = 'border-[var(--border-default)]';
                      let msg = 'Enter an amount';
                      let sub = '';

                      if (val > 0) {
                        if (!isBrand) {
                          // Creator side (negotiating up)
                          if (val <= base * 1.2) {
                            color = 'text-emerald-500'; bg = 'bg-emerald-500/10'; border = 'border-emerald-500/20';
                            msg = 'Reasonable Counter Offer!'; sub = "High chance of brand approval.";
                          } else if (val <= base * 1.5) {
                            color = 'text-amber-500'; bg = 'bg-amber-500/10'; border = 'border-amber-500/20';
                            msg = 'Premium Counter Offer'; sub = "A bit high, requires solid justification.";
                          } else {
                            color = 'text-rose-500'; bg = 'bg-rose-500/10'; border = 'border-rose-500/20';
                            msg = 'Significantly Higher Offer'; sub = "May face brand hesitation.";
                          }
                        } else {
                          // Brand side (negotiating down)
                          if (val >= base * 0.9) {
                            color = 'text-emerald-500'; bg = 'bg-emerald-500/10'; border = 'border-emerald-500/20';
                            msg = 'Very fair brand offer!'; sub = "High chance of creator's reply.";
                          } else if (val >= base * 0.7) {
                            color = 'text-amber-500'; bg = 'bg-amber-500/10'; border = 'border-amber-500/20';
                            msg = 'Discounted Offer'; sub = "Creator might negotiate up.";
                          } else {
                            color = 'text-rose-500'; bg = 'bg-rose-500/10'; border = 'border-rose-500/20';
                            msg = 'Considerably low offer'; sub = "Low chance of acceptance.";
                          }
                        }
                      }

                      return (
                        <div className={`mt-6 p-4 rounded-xl border ${bg} ${border} ${color} relative`}>
                          <div className={`absolute -top-2 left-8 w-4 h-4 rotate-45 border-t border-l ${bg} ${border.replace('border-', 'border-t-').replace('border-', 'border-l-')}`}></div>
                          <div className="font-bold text-sm relative z-10">{msg}</div>
                          {sub && <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1 relative z-10">{sub}</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

          </div>
          
        <AnimatePresence>
          {showAnalyticsPanel && (
            <CampaignAnalytics 
              thread={currentThread} 
              user={user} 
              onClose={() => setShowAnalyticsPanel(false)} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSafetyModal && <SafetyModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} onAccept={handleAcceptSafety} user={user} />}
        {showBriefModal && <SendBrief threadId={currentThread.id} onClose={() => setShowBriefModal(false)} onSent={() => { loadMessages(); refreshThread(); }} />}
        {showBrandAgreeModal && <BrandAgreement thread={currentThread} onClose={() => setShowBrandAgreeModal(false)} onSigned={() => { loadMessages(); refreshThread(); }} />}
        {showCreatorAgreeModal && <AgreementSign thread={currentThread} onClose={() => setShowCreatorAgreeModal(false)} onSigned={() => { loadMessages(); refreshThread(); }} />}
        {showInfoPanel && <DealInfoPanel thread={currentThread} role={isBrand ? 'brand' : 'creator'} onClose={() => setShowInfoPanel(false)} />}
        {showNegotiationTable && <NegotiationTable thread={currentThread} role={isBrand ? 'brand' : 'creator'} onClose={() => setShowNegotiationTable(false)} onActionComplete={() => { loadMessages(); refreshThread(); }} />}
      </AnimatePresence>
    </div>
  );
}
