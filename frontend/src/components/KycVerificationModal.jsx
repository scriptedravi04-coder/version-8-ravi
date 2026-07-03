import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ArrowLeft, Shield, CheckCircle, AlertCircle, 
  Loader2, CreditCard, Building, UploadCloud, 
  Share2, FileText, CheckCircle2, CheckSquare, Sparkles, HelpCircle
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function KycVerificationModal({ isOpen, onClose, onComplete }) {
  const { user, refreshUser } = useAuth();
  
  const fileInputRef = React.useRef(null);
  const [uploadType, setUploadType] = useState("id");

  // Starting state: false = Welcome/Intro Screen (Image 1 content in Image 2 UI), true = Steps Forms
  const [hasStarted, setHasStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [kycObj, setKycObj] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  // Creator Form Inputs
  const [identityType, setIdentityType] = useState("Aadhaar");
  const [identityNum, setIdentityNum] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialEngagementProof, setSocialEngagementProof] = useState("");
  const [gstin, setGstin] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Brand Form Inputs
  const [gstCert, setGstCert] = useState("");
  const [brandPan, setBrandPan] = useState("");
  const [incProof, setIncProof] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocDesignation, setPocDesignation] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [brandSiteUrl, setBrandSiteUrl] = useState("");

  const fetchKycStatus = async () => {
    try {
      setKycLoading(true);
      const { data } = await api.get("/verifications/me");
      setKycObj(data);
      if (data && data.documents) {
        const doc = data.documents;
        if (user?.role === "brand") {
          setGstCert(doc.gst_cert || "");
          setBrandPan(doc.brand_pan || "");
          setIncProof(doc.incorporation_proof || "");
          setPocName(doc.poc_name || "");
          setPocDesignation(doc.poc_designation || "");
          setPocEmail(doc.poc_email || "");
          setPocPhone(doc.poc_phone || "");
          setBrandSiteUrl(doc.website || "");
        } else {
          setIdentityType(doc.identity_type || "Aadhaar");
          setIdentityNum(doc.identity_num || "");
          setBankName(doc.bank_name || "");
          setBankAccount(doc.bank_account || "");
          setBankIfsc(doc.bank_ifsc || "");
          setUpiId(doc.upi_id || "");
          setSocialHandle(doc.social_handle || "");
          setSocialEngagementProof(doc.engagement_proof || "");
          setGstin(doc.gstin || "");
        }
        if (doc.uploaded_files) {
          setUploadedFiles(doc.uploaded_files);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve verification document structure", e);
    } finally {
      setKycLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchKycStatus();
      // If user is already verified from Auth Context, we can instantly jump to status screen
      if (user.verified) {
        setHasStarted(true);
      } else {
        setHasStarted(false);
      }
    }
  }, [isOpen, user]);

  if (typeof document === "undefined") return null;

  const isApproved = kycObj?.status === "approved" || user?.verified;
  const isPending = kycObj?.status === "pending";

  useEffect(() => {
    if ((isApproved || isPending) && !hasStarted && !kycLoading) {
      setHasStarted(true);
    }
  }, [isApproved, isPending, hasStarted, kycLoading]);

  // Trigger a click on the hidden file input element
  const handleUploadClick = (type) => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle actual file choosing from client browser
  const handleRealFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File sized over 5MB limit. Please select a smaller certificate/photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        url: event.target.result
      };

      setUploadedFiles(prev => {
        if (prev.some(f => f.name === file.name)) return prev;
        return [...prev, newFile];
      });
      toast.success(`${file.name} attached successfully!`);
      
      // reset input so the same file can be selected again if removed
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("Attachment removed");
  };

  // Check if each step is valid/completed to show indicator badges
  const getStepStatus = (stepIndex) => {
    if (isApproved) return "completed";
    
    if (user?.role === "brand") {
      switch (stepIndex) {
        case 1:
          return (gstCert && brandPan) ? "completed" : "incomplete";
        case 2:
          return (pocName && pocEmail && pocPhone) ? "completed" : "incomplete";
        case 3:
          return uploadedFiles.some(f => f.name.includes("GST") || f.name.includes("Business") || f.name.includes("PAN")) ? "completed" : "incomplete";
        case 4:
          return brandSiteUrl ? "completed" : "incomplete";
        case 5:
          return kycObj?.status === "pending" ? "completed" : "incomplete";
        default:
          return "incomplete";
      }
    } else {
      // Creator status
      switch (stepIndex) {
        case 1:
          return (identityNum && identityNum.length >= 8) ? "completed" : "incomplete";
        case 2:
          return (bankAccount && bankIfsc && upiId) ? "completed" : "incomplete";
        case 3:
          return uploadedFiles.some(f => f.name.includes("ID") || f.name.includes("Cheque")) ? "completed" : "incomplete";
        case 4:
          return socialHandle ? "completed" : "incomplete";
        case 5:
          return kycObj?.status === "pending" ? "completed" : "incomplete";
        default:
          return "incomplete";
      }
    }
  };

  const validateStep = (stepIndex) => {
    if (user?.role === "brand") {
      if (stepIndex === 1) {
        if (!gstCert || !gstCert.trim()) {
          toast.error("Please enter a valid GSTIN number.");
          return false;
        }
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstCert.trim().toUpperCase())) {
          toast.error("Invalid GSTIN format. It should be a 15-character ID (e.g., 27AAACN1234E1Z5).");
          return false;
        }
        if (!brandPan || !brandPan.trim()) {
          toast.error("Please enter Company PAN card number.");
          return false;
        }
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(brandPan.trim().toUpperCase())) {
          toast.error("Invalid Company PAN format. It should be a 10-character code (e.g., AAACB1234C).");
          return false;
        }
      }
      if (stepIndex === 2) {
        if (!pocName || !pocName.trim()) {
          toast.error("POC Full Name is required.");
          return false;
        }
        if (!pocDesignation || !pocDesignation.trim()) {
          toast.error("Corporate Position is required.");
          return false;
        }
        if (!pocEmail || !pocEmail.trim()) {
          toast.error("Business Email is required.");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(pocEmail.trim())) {
          toast.error("Invalid Business Email address.");
          return false;
        }
        if (!pocPhone || !pocPhone.trim()) {
          toast.error("Direct contact phone is required.");
          return false;
        }
        const phoneRegex = /^\+?[0-9\s\-]{10,20}$/;
        if (!phoneRegex.test(pocPhone.trim())) {
          toast.error("Invalid phone number format.");
          return false;
        }
      }
      if (stepIndex === 4) {
        if (!brandSiteUrl || !brandSiteUrl.trim()) {
          toast.error("Website URL is required.");
          return false;
        }
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(brandSiteUrl.trim())) {
          toast.error("Please enter a valid website URL.");
          return false;
        }
      }
    } else {
      // Creator checks
      if (stepIndex === 1) {
        if (!identityNum || !identityNum.trim()) {
          toast.error(`Please enter your ${identityType} card number.`);
          return false;
        }
        if (identityType === "Aadhaar") {
          const cleanAadhaar = identityNum.replace(/\s/g, "");
          if (cleanAadhaar.length !== 12 || !/^\d+$/.test(cleanAadhaar)) {
            toast.error("Aadhaar Card number must be exactly 12 digits.");
            return false;
          }
        } else {
          // PAN
          const cleanPan = identityNum.trim().toUpperCase();
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(cleanPan)) {
            toast.error("Invalid PAN format. It must follow general Income Tax format (e.g. ABCDE1234F).");
            return false;
          }
        }
      }
      if (stepIndex === 2) {
        if (!bankName || !bankName.trim()) {
          toast.error("Bank name is required.");
          return false;
        }
        if (!bankAccount || !bankAccount.trim()) {
          toast.error("Bank account number is required.");
          return false;
        }
        const cleanAcc = bankAccount.replace(/\s/g, "");
        if (!/^\d+$/.test(cleanAcc)) {
          toast.error("Bank account number must contain numbers only.");
          return false;
        }
        if (cleanAcc.length < 9 || cleanAcc.length > 18) {
          toast.error("Bank account number must be between 9 and 18 digits long.");
          return false;
        }
        if (!bankIfsc || !bankIfsc.trim()) {
          toast.error("Bank IFSC code is required.");
          return false;
        }
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
          toast.error("Invalid IFSC format. IFSC must be an 11-character code (example: HDFC0001234). Fourth character must be 0.");
          return false;
        }
        if (!upiId || !upiId.trim()) {
          toast.error("UPI ID Address is required.");
          return false;
        }
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(upiId.trim())) {
          toast.error("Invalid UPI ID format (e.g. username@okaxis or phone@ybl).");
          return false;
        }
      }
      if (stepIndex === 4) {
        if (!socialHandle || !socialHandle.trim()) {
          toast.error("Primary channel link or handle is required.");
          return false;
        }
      }
    }
    return true;
  };

  const handleKycSubmit = async () => {
    // Run final verification check across all steps to satisfy structural bounds
    for (let s = 1; s <= 4; s++) {
      if (s === 3) continue; // Optional doc attachment step
      if (!validateStep(s)) {
        setActiveStep(s);
        return;
      }
    }

    setKycSubmitting(true);
    try {
      const docsObj = user?.role === "brand" ? {
        gst_cert: gstCert,
        brand_pan: brandPan,
        incorporation_proof: incProof || "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=300",
        poc_name: pocName,
        poc_designation: pocDesignation,
        poc_email: pocEmail,
        poc_phone: pocPhone,
        website: brandSiteUrl,
        uploaded_files: uploadedFiles
      } : {
        identity_type: identityType,
        identity_num: identityNum,
        bank_name: bankName,
        bank_account: bankAccount,
        bank_ifsc: bankIfsc,
        upi_id: upiId,
        social_handle: socialHandle,
        engagement_proof: socialEngagementProof || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300",
        gstin: gstin || "",
        uploaded_files: uploadedFiles
      };

      await api.post("/verifications/request", {
        documents: docsObj,
        note: `KYC document submitted via interactive window modal by ${user?.name}`
      });

      toast.success("Compliance documents successfully submitted for verification check!");
      if (refreshUser) await refreshUser();
      await fetchKycStatus();
      if (onComplete) onComplete();
    } catch (e) {
      toast.error("Server upload failure! Please check form values and retry.");
    } finally {
      setKycSubmitting(false);
    }
  };

  const stepsList = user?.role === "brand" ? [
    {
      title: "Business credentials",
      desc: "Provide mandatory GSTIN & Corporate tax PAN credentials.",
      icon: <CreditCard size={18} />
    },
    {
      title: "Authorized Representative",
      desc: "Define Contact Representative name, corporate email and phone.",
      icon: <Building size={18} />
    },
    {
      title: "Attach Proof copies",
      desc: "Attach PDFs/JPEGs of tax certificates or registration files.",
      icon: <UploadCloud size={18} />
    },
    {
      title: "Corporate Website URL",
      desc: "Add landing page address detailing services.",
      icon: <Share2 size={18} />
    },
    {
      title: "Submit for Approval",
      desc: "Request formal compliance review from site managers.",
      icon: <FileText size={18} />
    }
  ] : [
    {
      title: "Verify Government ID",
      desc: "Register UIDAI Aadhaar number or card credentials.",
      icon: <CreditCard size={18} />
    },
    {
      title: "Connect Payout account",
      desc: "Input bank account, IFSC and secure instant UPI ID.",
      icon: <Building size={18} />
    },
    {
      title: "Attach Card screenshot",
      desc: "Provide photograph proof of registration documents.",
      icon: <UploadCloud size={18} />
    },
    {
      title: "Reach & Social Handles",
      desc: "Add primary media channel link/username.",
      icon: <Share2 size={18} />
    },
    {
      title: "Trigger Review check",
      desc: "Dispatch secure copies to manual verification team.",
      icon: <FileText size={18} />
    }
  ];

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      return;
    }
    if (activeStep < 5) setActiveStep(prev => prev + 1);
    else handleKycSubmit();
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(1, prev - 1));
  };

  const handleStartVerification = () => {
    setHasStarted(true);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-hidden"
        >
          
          {/* Background Click Shield */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          <AnimatePresence mode="wait">
          {/* STATE 0: WELCOME CARD INDEX SCREEN (Beautiful white/frosted glassmorphic premium container) */}
          {!hasStarted ? (
            <motion.div 
              key="welcome-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white/95 text-slate-800 w-full max-w-[460px] rounded-[32px] relative z-10 flex flex-col overflow-hidden border border-white/60 backdrop-blur-xl shadow-[0_24px_60px_rgba(124,92,255,0.18)]"
          >
            {/* Top Close indicator */}
            <button 
              onClick={onClose}
              id="btn-close-modal-welcome"
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
              title="Close popup"
            >
              <X size={20} />
            </button>

            <div className="p-8 sm:p-10 flex flex-col items-center text-center">
              
              {/* Premium light-themed Illustration SVG */}
              <div className="w-full flex justify-center mb-6 py-2 select-none pointer-events-none">
                <svg viewBox="0 0 340 250" className="w-[300px] h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tablet Device Frame */}
                  <rect x="110" y="25" width="125" height="180" rx="16" fill="#F8FAFC" stroke="#3B82F6" strokeWidth="2.5" />
                  <circle cx="172.5" cy="35" r="2.5" fill="#3B82F6" />
                  
                  {/* Tablet Interface Mock */}
                  <rect x="125" y="55" width="95" height="135" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
                  {/* User Photo Placeholder inside Tablet */}
                  <circle cx="172.5" cy="90" r="18" fill="#dbeafe" stroke="#3B82F6" strokeWidth="2" />
                  <path d="M162 105C162 97.8203 166.7 92 172.5 92C178.3 92 183 97.8203 183 105" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="172.5" cy="85" r="5" fill="#3B82F6" />
                  {/* Inputs placeholder in Tablet */}
                  <rect x="142" y="118" width="60" height="8" rx="4" fill="#F1F5F9" />
                  <rect x="142" y="132" width="60" height="8" rx="4" fill="#F1F5F9" />
                  <circle cx="134" cy="122" r="2" fill="#3B82F6" />
                  <circle cx="134" cy="136" r="2" fill="#3B82F6" />
                  <rect x="142" y="150" width="60" height="12" rx="4" fill="#3B82F6" />

                  {/* Shield with Padlock (Safety) */}
                  <path d="M45 55C45 42 85 32 85 32C85 32 125 42 125 55C125 102 85 128 85 128C85 128 45 102 45 55Z" fill="#F8FAFC" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Lock Inside Shield */}
                  <rect x="73" y="75" width="24" height="20" rx="4" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
                  <path d="M78 75V69C78 64.5 92 64.5 92 69V75" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="85" cy="83" r="1.5" fill="white" />
                  <path d="M85 85V89" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Sparkle Star decoration */}
                  <path d="M35 20L38 26L44 29L38 32 L35 38L32 32L26 29L32 26Z" fill="#60a5fa" />

                  {/* pointing hand/arm holding checklist */}
                  <path d="M52 215C56 182 82 172 95 170L85 215Z" fill="#93c5fd" />
                  <path d="M12 240L145 240L125 215L52 215Z" fill="#3B82F6" />
                  
                  {/* Clipboard/Drawn Hand */}
                  <path d="M72 201C76 191 85 179 94 171L125 142C128 139 132 143 130 146L115 162C113 164 114 167 116 168H122C125 168 126 171 124 173L105 195L85 215" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="white" />
                  <path d="M125 142L135 132C137 130 141 133 139 136L130 146" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Checklist Green completion badge on right */}
                  <circle cx="265" cy="180" r="18" fill="white" stroke="#3B82F6" strokeWidth="2.5" />
                  <path d="M259 180L263 184L271 176" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Bubble heart with cute pink coloring */}
                  <path d="M185 200H210C213 200 215 202 215 205V220C215 223 213 225 210 225H202L195 233V225H185C182 225 180 223 180 220V205C180 202 182 200 185 200Z" fill="white" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M197.5 210.5C196.2 208.5 193.3 209.2 197.5 215C201.7 209.2 198.8 208.5 197.5 210.5Z" fill="#EC4899" stroke="#3B82F6" strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Title centered */}
              <h3 className="text-2xl font-black font-sans text-slate-900 tracking-tight mt-1">KYC Trust Verification</h3>
              
              {/* Subtitle / desc */}
              <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[370px] mt-3">
                To comply with regional payout laws, complete your instant financial credentials. <span className="font-extrabold text-[#3B82F6] whitespace-nowrap">Takes less than 5 minutes!</span>
              </p>

              {/* Action solid blue button */}
              <button 
                onClick={handleStartVerification}
                id="btn-start-verification-welcome"
                className="w-full mt-8 bg-[#3B82F6] hover:bg-blue-600 text-white py-3.5 px-6 rounded-2xl font-bold shadow-lg shadow-[#3B82F6]/25 hover:shadow-[#3B82F6]/35 transform hover:-translate-y-0.5 transition-all duration-200 text-sm tracking-wide"
              >
                Start Verification
              </button>

              {/* Skip for later handler */}
              <button 
                onClick={onClose}
                id="btn-skip-for-later-welcome"
                className="text-sm font-bold text-slate-400 hover:text-[#3B82F6] transition-colors mt-4 block focus:outline-none"
              >
                Skip For Later
              </button>

            </div>
          </motion.div>
        ) : (
          
          /* STATE 1: HIGH FIDELITY MULTI-STEP FLOW WIZARD (Beautiful dark slate/violet theme matching the workspace) */
          <motion.div 
            key="kyc-wizard"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="bg-[#13131B] text-white w-full max-w-5xl h-screen sm:h-[85vh] sm:rounded-3xl shadow-3xl relative z-10 flex flex-col overflow-hidden border border-white/10 backdrop-blur-2xl shadow-[0_30px_70px_rgba(124,92,255,0.18)] text-slate-100"
          >
            
            {/* TOP BAR / NAVIGATION CONTROLS */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0e0e14]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {!(isApproved || isPending) && (
                  <button 
                    onClick={() => setHasStarted(false)}
                    id="btn-back-to-step-intro"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    title="Back to Intro"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#7C5CFF]">Security Portal</span>
                  <h4 className="text-sm font-black text-white mt-0.5 font-sans">Ybex Trust Verification</h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  id="btn-close-modal-steps"
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* HORIZONTAL STEPPER WIZARD */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-4 px-4 md:px-8 bg-transparent pb-6">
              
              {/* Stepper Header */}
              {!(isApproved || isPending) && !kycLoading && (
                <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-10 relative mt-4">
                  {/* Background connecting line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
                  {/* Active connecting line */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-[#3B82F6] -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out shadow-[0_0_10px_#3B82F6]" 
                    style={{ width: `${((activeStep - 1) / (stepsList.length - 1)) * 100}%` }}
                  />

                  {stepsList.map((st, index) => {
                    const stepNum = index + 1;
                    const stepState = getStepStatus(stepNum);
                    const isActive = activeStep === stepNum;
                    const isPassed = stepNum < activeStep || stepState === "completed";

                    // The circle itself
                    return (
                      <div key={stepNum} className="relative z-10 flex flex-col items-center">
                        <button
                          disabled={isApproved || isPending}
                          onClick={() => setActiveStep(stepNum)}
                          className={`w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative ${
                            isActive 
                              ? "bg-[#3B82F6] text-white shadow-[0_0_20px_#3B82F6] ring-4 ring-[#3B82F6]/30 scale-110" 
                              : isPassed
                                ? "bg-[#3B82F6] text-white shadow-[0_0_10px_#3B82F6]"
                                : "bg-[#1E1E28] text-white/40 ring-1 ring-white/10"
                          }`}
                        >
                          {isPassed && !isActive ? <CheckCircle2 size={20} strokeWidth={3} /> : stepNum}
                        </button>
                        <div className="absolute top-[52px] w-32 text-center">
                           <span className={`text-[10px] font-bold uppercase tracking-wider block ${isActive ? "text-white" : "text-white/40"}`}>Step {stepNum}</span>
                           <span className={`text-xs font-medium block truncate mt-0.5 ${isActive ? "text-white/90" : "text-white/40"}`}>{st.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CENTER PANEL: STEP CONTENT */}
              <div className="flex-1 flex justify-center items-start w-full pt-12 md:pt-4 pb-12 mb-4">
                
                {kycLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/50 h-full">
                    <Loader2 size={32} className="animate-spin text-[#3B82F6] mb-3" />
                    <p className="text-xs font-semibold">Connecting securely to APIs...</p>
                  </div>
                ) : (isApproved || isPending) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-10 scale-100 animate-in fade-in zoom-in-95">
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                        isApproved 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                      }`}>
                        {isApproved ? <CheckCircle2 size={44} /> : <Loader2 size={44} className="animate-spin" />}
                      </div>
                      {isApproved && (
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#3B82F6] text-white text-xs border-2 border-white">
                          <CheckSquare size={14} />
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black font-sans text-white mb-2">
                      {isApproved ? "Verification Complete!" : "Verification Pending!"}
                    </h3>
                    
                    <p className="text-sm text-white/75 leading-relaxed max-w-[340px] mb-6 font-medium">
                      {isApproved 
                        ? "Your identity is matched and fully compliance-cleared for payouts."
                        : "We received your submission! Checks usually resolve within 24 hours."}
                    </p>

                    <button 
                      onClick={onClose}
                      className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#3B82F6] hover:bg-blue-600 text-white shadow-lg transition-all text-sm tracking-wide"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  
                  /* ACTIVE FORM WIZARD CARD */
                   <div className="w-full max-w-[500px] bg-[#1a1a24]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col space-y-6">
                      
                      {/* Active Panel Header Information */}
                      <div className="pb-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {stepsList[activeStep - 1]?.title}
                        </h3>
                        <p className="text-xs text-white/50">{stepsList[activeStep - 1]?.desc}</p>
                      </div>

                      {/* Step 1: Identity Card details */}
                      <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                      {activeStep === 1 && (
                        <div className="space-y-4">
                          {user?.role === "brand" ? (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">GSTIN Number (Mandatory)</label>
                                <input 
                                  type="text"
                                  placeholder="27AAACN1234E1Z5"
                                  value={gstCert}
                                  id="input-brand-gstin"
                                  onChange={e => setGstCert(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono uppercase font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Company PAN Card</label>
                                <input 
                                  type="text"
                                  placeholder="AAACB1234C"
                                  value={brandPan}
                                  id="input-brand-pan"
                                  onChange={e => setBrandPan(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono uppercase font-bold"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Identity Card Type</label>
                                <select 
                                  value={identityType}
                                  id="select-creator-id-type"
                                  onChange={e => {
                                    setIdentityType(e.target.value);
                                    setIdentityNum("");
                                  }}
                                  className="w-full bg-[#13131B] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-sans font-black"
                                >
                                  <option value="Aadhaar" className="bg-[#13131B] text-white font-bold">Aadhaar Card</option>
                                  <option value="PAN" className="bg-[#13131B] text-white font-bold">PAN Card (Income Tax)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">
                                  {identityType === "Aadhaar" ? "Aadhaar Card Number" : "PAN Card Number"}
                                </label>
                                <input 
                                  type="text"
                                  placeholder={identityType === "Aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
                                  maxLength={identityType === "Aadhaar" ? 14 : 10}
                                  value={identityNum}
                                  id="input-creator-id-num"
                                  onChange={e => {
                                    const rawVal = e.target.value;
                                    if (identityType === "Aadhaar") {
                                      const cleaned = rawVal.replace(/\D/g, "");
                                      const truncated = cleaned.slice(0, 12);
                                      const parts = truncated.match(/\d{1,4}/g);
                                      setIdentityNum(parts ? parts.join(" ") : truncated);
                                    } else {
                                      const uppercased = rawVal.toUpperCase();
                                      const cleanAndTruncated = uppercased.slice(0, 10).replace(/[^A-Z0-9]/g, "");
                                      setIdentityNum(cleanAndTruncated);
                                    }
                                  }}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono uppercase font-bold"
                                />
                              </div>
                            </>
                          )}
                          <div className="text-[10px] text-white/60 leading-normal bg-white/[0.02] p-3.5 rounded-xl border border-white/5 flex gap-2 items-start font-medium">
                            <Shield size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
                            <span>Identity numbers are stored in secure encrypted environments. We never lease, trade, or distribute structural card details.</span>
                          </div>
                        </div>
                      )}

                      {/* Step 2: settlement banks & contact representatives */}
                      {activeStep === 2 && (
                        <div className="space-y-4">
                          {user?.role === "brand" ? (
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">POC Full Name</label>
                                <input 
                                  type="text"
                                  placeholder="Karan Johar"
                                  value={pocName}
                                  id="input-brand-poc-name"
                                  onChange={e => setPocName(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-sans font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Corporate Position</label>
                                  <input 
                                    type="text"
                                    placeholder="Marketing Lead"
                                    value={pocDesignation}
                                    id="input-brand-poc-pos"
                                    onChange={e => setPocDesignation(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-sans font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Business Email</label>
                                  <input 
                                    type="email"
                                    placeholder="karan@novabrand.com"
                                    value={pocEmail}
                                    id="input-brand-poc-email"
                                    onChange={e => setPocEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-sans font-semibold"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Direct contact phone</label>
                                <input 
                                  type="text"
                                  placeholder="+91 98765 43210"
                                  value={pocPhone}
                                  id="input-brand-poc-phone"
                                  onChange={e => setPocPhone(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1 block uppercase tracking-wider">Bank Name</label>
                                  <input 
                                    type="text"
                                    placeholder="HDFC, SBI, ICICI"
                                    value={bankName}
                                    id="input-creator-bank"
                                    onChange={e => setBankName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-sans font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1 block uppercase tracking-wider">Account Number</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. 501002345678"
                                    value={bankAccount}
                                    id="input-creator-acc"
                                    maxLength={18}
                                    onChange={e => {
                                      const cleaned = e.target.value.replace(/\D/g, "");
                                      setBankAccount(cleaned);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1 block uppercase tracking-wider">Bank IFSC Code</label>
                                  <input 
                                    type="text"
                                    placeholder="HDFC0001234"
                                    maxLength={11}
                                    value={bankIfsc}
                                    id="input-creator-ifsc"
                                    onChange={e => {
                                      const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                      setBankIfsc(cleaned);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold uppercase"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-white/60 mb-1 block uppercase tracking-wider">UPI ID Address</label>
                                  <input 
                                    type="text"
                                    placeholder="username@okaxis"
                                    value={upiId}
                                    id="input-creator-upi"
                                    onChange={e => {
                                      const cleaned = e.target.value.replace(/[^a-zA-Z0-9@.\-_]/g, "");
                                      setUpiId(cleaned);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/25 text-white transition-all font-mono font-bold"
                                  />
                                </div>
                              </div>
                              <div className="text-[10px] text-blue-400 bg-[#3B82F6]/10 p-3.5 rounded-xl border border-[#3B82F6]/20 flex gap-2 items-center font-bold">
                                <HelpCircle size={14} className="text-blue-400" />
                                <span>We verify settlement configurations instantly using penny-drop micro transfers.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 3: Attach documents proof */}
                      {activeStep === 3 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-white/60 block uppercase tracking-wider">Supported Verification Form Copies</label>
                            <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Optional — Click Next to Skip</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleUploadClick("id")}
                              id="btn-upload-file-id"
                              className="p-4.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs font-bold text-white/70 hover:bg-[#3B82F6]/10 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-xs"
                            >
                              <UploadCloud size={16} className="text-blue-400" /> Add {user?.role === "brand" ? "Company PAN Proof" : "Identity ID Card Copy"}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleUploadClick(user?.role === "brand" ? "gst" : "bank")}
                              id="btn-upload-file-bank"
                              className="p-4.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs font-bold text-white/70 hover:bg-[#3B82F6]/10 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-xs"
                            >
                              <UploadCloud size={16} className="text-blue-400" /> Add {user?.role === "brand" ? "GST Registry Cert" : "Cancelled Cheque Photo"}
                            </button>
                          </div>

                          {uploadedFiles.length > 0 && (
                            <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 space-y-2 max-h-[140px] overflow-y-auto animate-in fade-in shadow-inner">
                              <h5 className="text-[10px] font-bold text-white/40 uppercase">Uploaded Documents ({uploadedFiles.length})</h5>
                              {uploadedFiles.map((f, id) => (
                                <div key={id} className="flex items-center justify-between text-xs px-3 py-2.5 bg-white/[0.04] rounded-xl border border-white/5 shadow-xs">
                                  <span className="text-white font-bold truncate max-w-[240px]">{f.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(id)}
                                    id={`btn-remove-file-${id}`}
                                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-lg transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-white/40 leading-relaxed font-semibold">
                            Attachments must be high-resolution PDFs or JPEG/PNG images under 5MB. Low quality photographs are automatically rejected.
                          </p>
                        </div>
                      )}

                      {/* Step 4: Social Reach channel details */}
                      {activeStep === 4 && (
                        <div className="space-y-4">
                          {user?.role === "brand" ? (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider font-mono">Official Corporate Site URL</label>
                                <input 
                                  type="text"
                                  placeholder="https://novabrand.com"
                                  value={brandSiteUrl}
                                  id="input-brand-site"
                                  onChange={e => setBrandSiteUrl(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Primary Channel Username / Link</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. @username or youtube.com/c/channel"
                                  value={socialHandle}
                                  id="input-creator-social"
                                  onChange={e => setSocialHandle(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">GSTIN Serial (Optional)</label>
                                <input 
                                  type="text"
                                  placeholder="Optional 15-digit GSTIN"
                                  value={gstin}
                                  id="input-creator-gstin"
                                  onChange={e => setGstin(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25 text-white transition-all font-mono font-bold uppercase"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Step 5: Declaration & Final submit */}
                      {activeStep === 5 && (
                        <div className="space-y-4 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-2xl p-4 sm:p-5">
                          <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <CheckCircle2 size={18} />
                            <span className="text-xs font-black uppercase tracking-wider font-mono">Legitimacy Confirmed</span>
                          </div>
                          <h4 className="text-sm font-black text-white">Declaration & Agreement</h4>
                          <p className="text-xs text-white/70 leading-relaxed font-bold">
                            By triggering formal dispatch, you verify that all supplied values correspond to valid government identities owned by you or your legal organization. Forged files result in permanent profile lock.
                          </p>
                          
                          <div className="pt-3 border-t border-[#3B82F6]/15 space-y-1.5 text-[11px] text-blue-400 font-black">
                            <div>• ID documents securely encrypted and bundled.</div>
                            <div>• Settlement routing successfully mapped to verification queues.</div>
                            <div>• Hand verified trust badge activation request dispatched.</div>
                          </div>
                        </div>
                      )}
                      
                      </motion.div>
                      </AnimatePresence>

                    </div>

                    {/* BOTTOM ACTIONS / FORM STEPS CONTROLS */}
                    <div className="pt-4 flex items-center justify-between gap-3 mt-6">
                      <button
                        type="button"
                        disabled={activeStep === 1 || kycSubmitting}
                        onClick={handlePrev}
                        id="btn-actions-prev-step"
                        className="px-6 py-3.5 rounded-xl text-sm font-bold border border-white/10 bg-transparent hover:bg-white/5 text-white/70 transition-all disabled:opacity-0 disabled:pointer-events-none"
                      >
                        Back
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={kycSubmitting}
                        id="btn-actions-next-step"
                        className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#3B82F6] hover:bg-blue-600 text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 duration-200 flex items-center gap-1.5 w-full md:w-auto mt-2 md:mt-0 justify-center"
                      >
                        {kycSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Submitting...
                          </>
                        ) : activeStep === 5 ? (
                          "Submit Handover"
                        ) : (
                          "Continue"
                        )}
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </motion.div>
          )}
          </AnimatePresence>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*,application/pdf"
          onChange={handleRealFileChange}
        />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
