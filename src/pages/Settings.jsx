import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Users, Briefcase, HelpCircle, ChevronRight, Share2,
  ArrowLeft, Camera, Edit2, CheckCircle, AlertCircle, Globe, Grid, MapPin,
  MessageSquare, Package, Calendar, LogOut, Instagram, Youtube, Twitter, Linkedin,
  X, Smartphone, Mail, MonitorSmartphone, Link as LinkIcon, Download, Loader2, Plus, Trash2, Eye
} from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import KycVerificationModal from "../components/KycVerificationModal";
import { CategoryAutocomplete, LocationAutocomplete } from "../components/ui/autocomplete";

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [profile, setProfile] = useState({
    name: user?.name || "Ravi Sharma",
    profession: "Content Creation",
    niche: "Tech & Gadgets",
    subCategories: ["Mobile Reviews", "Laptops", "Smart Home"],
    language: "English, Hindi",
    location: "Mumbai, India",
    socials: [
      { id: 1, platform: 'Instagram', url: 'https://instagram.com/ravi_tech' },
      { id: 2, platform: 'YouTube', url: 'https://youtube.com/c/RaviTech' }
    ],
    barterPrefs: ["High-end Products", "Travel Experiences"],
    paymentTimeline: "Within 30 Days",
    phone: "+91 98765 43210",
    businessEmail: "collabs@ravitech.in"
  });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      startLoading();
      try {
        if (user.role === "brand") {
          let data;
          if (supabase) {
             const res = await supabase.from('brand_profiles').select('*').eq('user_id', user.id).single();
             if (res.data) data = res.data;
          }
          if (!data) {
             const res = await api.get("/brands/me");
             data = res.data;
          }
          if (mounted && data) {
            setProfile(prev => ({
              ...prev,
              name: data.company_name || prev.name,
              niche: data.industry || "FMCG / D2C",
              subCategories: [],
              language: "English",
              location: (data.city || data.state) ? `${data.city || ""}, ${data.state || ""}`.replace(/^, |, $/g, "") : prev.location,
              socials: data.website_url ? [{ id: 1, platform: "Website", url: data.website_url }] : (data.website ? [{ id: 1, platform: "Website", url: data.website }] : []),
              businessEmail: data.email || prev.businessEmail,
              phone: data.phone || prev.phone,
              profession: "Corporate Brand"
            }));
          }
        } else {
           let data;
           if (supabase) {
             const res = await supabase.from('creator_profiles').select('*').eq('user_id', user.id).single();
             if (res.data) data = res.data;
           }
           if (!data) {
             const res = await api.get(`/creators/${user.id}`);
             data = res.data;
           }
          if (mounted && data) {
            const extras = data.rate_card && data.rate_card.extras ? data.rate_card.extras : {};
            setProfile(prev => ({
              ...prev,
              name: data.name || data.full_name || prev.name,
              niche: data.category || data.primary_niche || prev.niche,
              subCategories: data.sub_categories || prev.subCategories,
              language: data.languages ? (Array.isArray(data.languages) ? data.languages.join(", ") : data.languages) : prev.language,
              location: data.city || data.state ? `${data.city || ''}, ${data.state || ''}`.replace(/^, |, $/g, '') : prev.location,
              socials: data.instagram_handle || data.instagram || data.youtube || data.twitter || data.linkedin ? [
                ...(data.instagram_handle || data.instagram ? [{id: 1, platform: 'Instagram', url: data.instagram_handle || data.instagram}] : []),
                ...(data.youtube ? [{id: 2, platform: 'YouTube', url: data.youtube}] : []),
                ...(data.twitter ? [{id: 3, platform: 'Twitter', url: data.twitter}] : []),
                ...(data.linkedin ? [{id: 4, platform: 'LinkedIn', url: data.linkedin}] : []),
              ] : prev.socials,
              businessEmail: data.email || prev.businessEmail,
              barterPrefs: data.barter_mode ? [data.barter_mode] : (data.barter ? [data.barter.replace(/_/g, ' ')] : prev.barterPrefs),
              paymentTimeline: data.payment_terms || prev.paymentTimeline,
              profession: extras.profession || prev.profession,
              phone: extras.phone || prev.phone
            }));
          }
        }
      } catch (e) {
        console.warn("Could not load profile, falling back.", e);
      } finally {
        if (mounted) stopLoading();
      }
    }
    loadData();
    return () => { mounted = false };
  }, [user, startLoading, stopLoading]);

  // KYC States
  const [kycObj, setKycObj] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [showKycVerificationModal, setShowKycVerificationModal] = useState(false);

  // Creator KYC inputs
  const [identityType, setIdentityType] = useState("Aadhaar");
  const [identityNum, setIdentityNum] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialEngagementProof, setSocialEngagementProof] = useState("");
  const [gstin, setGstin] = useState("");

  // Brand KYC inputs
  const [gstCert, setGstCert] = useState("");
  const [brandPan, setBrandPan] = useState("");
  const [incProof, setIncProof] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocDesignation, setPocDesignation] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [brandSiteUrl, setBrandSiteUrl] = useState("");

  // Upload simulation states
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [activeSessionsList, setActiveSessionsList] = useState([
    { id: 1, name: 'MacBook Pro (Chrome)', location: 'Noida, India', time: 'Active Now', isCurrent: true },
    { id: 2, name: 'iPhone 14 Pro (Safari)', location: 'Mumbai, India', time: '2 hours ago', isCurrent: false }
  ]);

  const handleLogoutSession = (sessionId) => {
    setActiveSessionsList(prev => prev.filter(s => s.id !== sessionId));
    toast.success("Successfully logged out of the device.");
  };

  const handleLogoutAllOtherSessions = () => {
    setActiveSessionsList(prev => prev.filter(s => s.isCurrent));
    toast.success("Logged out of all other sessions");
    closeModal();
  };

  const fetchKycStatus = async () => {
    try {
      const { data } = await api.get("/verifications/me");
      setKycObj(data);
      if (data && data.documents) {
        const doc = data.documents;
        if (user.role === "creator") {
          setIdentityType(doc.identity_type || "Aadhaar");
          setIdentityNum(doc.identity_num || "");
          setBankName(doc.bank_name || "");
          setBankAccount(doc.bank_account || "");
          setBankIfsc(doc.bank_ifsc || "");
          setUpiId(doc.upi_id || "");
          setSocialHandle(doc.social_handle || "");
          setSocialEngagementProof(doc.engagement_proof || "");
          setGstin(doc.gstin || "");
        } else if (user.role === "brand") {
          setGstCert(doc.gst_cert || "");
          setBrandPan(doc.brand_pan || "");
          setIncProof(doc.incorporation_proof || "");
          setPocName(doc.poc_name || "");
          setPocDesignation(doc.poc_designation || "");
          setPocEmail(doc.poc_email || "");
          setPocPhone(doc.poc_phone || "");
          setBrandSiteUrl(doc.website || "");
        }
        if (doc.uploaded_files) {
          setUploadedFiles(doc.uploaded_files);
        }
      }
    } catch (e) {
      console.warn("Error fetching KYC", e);
    } finally {
      setKycLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [user]);

  useEffect(() => {
    if (!kycLoading && (window.location.search?.includes("section=kyc") || window.location.hash === "#kyc")) {
      setShowKycVerificationModal(true);
    }
  }, [kycLoading]);

  const handleSimulatedUpload = (type) => {
    let filename = type === "id" ? `${identityType}_Card_Proof.jpg` : "Business_GST_TaxDoc.pdf";
    if (type === "bank") filename = "Bank_CancelCheck.png";
    if (type === "social") filename = "Followers_Screenshot.jpg";

    const newFile = {
      name: filename,
      size: "1.4 MB",
      url: "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=500"
    };

    setUploadedFiles(prev => [...prev, newFile]);
    toast.success(`${filename} document added!`);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("Attachment removed");
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();

    if (user.role === "creator") {
      if (!identityNum) {
        toast.error("Please enter your identity card (Aadhaar/PAN) number.");
        return;
      }
      if (!bankAccount || !bankIfsc) {
        toast.error("Please fill in your Bank Account & IFSC code details.");
        return;
      }
      if (!upiId) {
        toast.error("Please provide UPI ID representation.");
        return;
      }
      if (!socialHandle) {
        toast.error("Please enter Instagram or YouTube handle.");
        return;
      }
    } else if (user.role === "brand") {
      if (!gstCert) {
        toast.error("GST Certificate serial/status number is mandatory for Brands.");
        return;
      }
      if (!brandPan) {
        toast.error("Please enter Business PAN card number.");
        return;
      }
      if (!pocName || !pocEmail || !pocPhone) {
        toast.error("Please fill in Point of Contact name, work email and phone.");
        return;
      }
    }

    setKycSubmitting(true);
    try {
      const docsObj = user.role === "creator" ? {
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
      } : {
        gst_cert: gstCert,
        brand_pan: brandPan,
        incorporation_proof: incProof || "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=300",
        poc_name: pocName,
        poc_designation: pocDesignation,
        poc_email: pocEmail,
        poc_phone: pocPhone,
        website: brandSiteUrl,
        uploaded_files: uploadedFiles
      };

      await api.post("/verifications/request", {
        documents: docsObj,
        note: `KYC direct registration submitted by ${user.name}`
      });

      toast.success("KYC request submitted! Manual compliance verification normally takes 24-48 hours.");
      fetchKycStatus();
      if (refreshUser) refreshUser();
    } catch (e) {
      toast.error("Failed to submit verification keys, check fields and retry.");
    } finally {
      setKycSubmitting(false);
    }
  };

  const [activeModal, setActiveModal] = useState(null); // 'name', 'socials', 'niche', etc.
  const [isSaving, setIsSaving] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Temporary state for the modal forms
  const [formData, setFormData] = useState({});

  const handleEdit = (field) => {
    setFormData(profile);
    setActiveModal(field);
    setOtpSent(false);
    setOtpCode("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setOtpSent(false);
    setOtpCode("");
  };

  const handleSave = async () => {
    if (['phone', 'businessEmail'].includes(activeModal) && !otpSent) {
      startLoading();
      // Simulate OTP send delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setOtpSent(true);
      stopLoading();
      toast.success("Verification code sent!");
      return;
    }

    if (['phone', 'businessEmail'].includes(activeModal) && otpSent) {
      if (otpCode !== "1234") {
        toast.error("Invalid verification code (use 1234 for demo)");
        return;
      }
    }

    startLoading();
    
    try {
      // Basic splitting for location and language
      const locParts = (formData.location || "").split(",");
      const city = locParts[0]?.trim() || "";
      const state = locParts[1]?.trim() || "";
      const languages = (formData.language || "").split(",").map(s => s.trim()).filter(Boolean);
      
      const insta = formData.socials?.find(s => s.platform === 'Instagram')?.url || "";
      const yt = formData.socials?.find(s => s.platform === 'YouTube')?.url || "";
      const twit = formData.socials?.find(s => s.platform === 'Twitter')?.url || "";
      const link = formData.socials?.find(s => s.platform === 'LinkedIn')?.url || "";

      let currRateCard = {};
      try {
        const { data: currData } = await api.get(`/creators/${user.id}`);
        currRateCard = currData?.rate_card || {};
      } catch (e) { }

      const payload = {
        name: formData.name,
        category: formData.niche,
        sub_categories: formData.subCategories,
        languages: languages,
        city: city,
        state: state,
        email: formData.businessEmail,
        instagram: insta,
        youtube: yt,
        twitter: twit,
        linkedin: link,
        barter: formData.barterPrefs?.[0]?.replace(/ /g, '_') || 'barter_ok',
        payment_terms: formData.paymentTimeline,
        rate_card: {
           ...currRateCard,
           extras: {
             profession: formData.profession,
             phone: formData.phone
           }
        }
      };

      await api.post('/creators/profile', payload);
      
      refreshUser();
      setProfile(formData);
      toast.success("Profile updated successfully!");
    } catch(err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      stopLoading();
      closeModal();
    }
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'name':
      case 'profession':
      case 'language': {
        const labels = {
          name: "Update Name", profession: "Update Profession", language: "Update Language",
        };
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">{labels[activeModal]}</h3>
            <input 
              type="text" 
              value={formData[activeModal]} 
              onChange={e => handleFormChange(activeModal, e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors mb-6 text-[var(--text-primary)]"
            />
          </>
        );
      }
      case 'location': {
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Update Location</h3>
            <LocationAutocomplete 
              value={formData.location}
              onChange={val => handleFormChange('location', val)}
              className="mb-8"
              placeholder="Search your city..."
            />
            <div className="h-32"></div>
          </>
        )
      }
      case 'phone':
      case 'businessEmail': {
        const labels = {
          phone: "Change Phone Number", businessEmail: "Update Business Email"
        };
        const destLabel = activeModal === 'phone' ? "Enter new phone number" : "Enter new business email";
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">{labels[activeModal]}</h3>
            {!otpSent ? (
              <div className="mb-6">
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">{destLabel}</label>
                <input 
                  type="text" 
                  value={formData[activeModal]} 
                  onChange={e => handleFormChange(activeModal, e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors text-[var(--text-primary)]"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Enter Verification Code</label>
                <input 
                  type="text" 
                  value={otpCode} 
                  placeholder="1234"
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors text-[var(--text-primary)] text-center font-mono tracking-[0.5em] text-xl"
                  maxLength={4}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-3 text-center">We've sent a 4-digit code to {formData[activeModal]}</p>
              </div>
            )}
          </>
        );
      }
      case 'niche':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Content Category</h3>
            <div className="mb-4">
              <CategoryAutocomplete
                label="Primary Category"
                placeholder="Search category (e.g., Tech & Gadgets)"
                value={formData.niche}
                onChange={(val) => handleFormChange('niche', val)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Sub-categories (comma separated)</label>
              <input 
                type="text"
                value={formData.subCategories.join(", ")}
                onChange={e => handleFormChange('subCategories', e.target.value.split(",").map(s => s.trim()))}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] text-[var(--text-primary)]"
              />
            </div>
            <div className="h-[120px]"></div>
          </>
        );
      case 'socials':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Edit Socials</h3>
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto scroll-thin">
              {formData.socials.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select 
                    value={s.platform}
                    onChange={e => {
                      const newSocials = [...formData.socials];
                      newSocials[i].platform = e.target.value;
                      handleFormChange('socials', newSocials);
                    }}
                    className="w-1/3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7C5CFF] text-[var(--text-primary)]"
                  >
                    <option>Instagram</option><option>YouTube</option><option>Twitter</option><option>LinkedIn</option><option>TikTok</option>
                  </select>
                  <input 
                    type="text" 
                    value={s.url}
                    onChange={e => {
                      const newSocials = [...formData.socials];
                      newSocials[i].url = e.target.value;
                      handleFormChange('socials', newSocials);
                    }}
                    className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C5CFF] text-[var(--text-primary)]"
                  />
                  <button onClick={() => {
                    const newSocials = formData.socials.filter((_, idx) => idx !== i);
                    handleFormChange('socials', newSocials);
                  }} className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleFormChange('socials', [...formData.socials, { id: Date.now(), platform: 'Instagram', url: '' }])}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-[var(--text-secondary)] font-semibold text-sm hover:border-[var(--violet)]/20 hover:text-[#7C5CFF] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16}/> Add another profile
              </button>
            </div>
          </>
        );
      case 'collabPrefs':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Collaboration Preferences</h3>
            <div className="mb-5">
               <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Barter Preferences</label>
               <div className="space-y-2">
                 {["High-end Products", "Travel Experiences", "Service Exchange", "Food & Dining"].map((opt) => (
                   <label key={opt} className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 cursor-pointer hover:border-white/20 transition-all">
                     <input type="checkbox" className="w-4 h-4 rounded accent-[#7C5CFF]"
                       checked={formData.barterPrefs.includes(opt)}
                       onChange={(e) => {
                         const newPrefs = e.target.checked 
                           ? [...formData.barterPrefs, opt] 
                           : formData.barterPrefs.filter(p => p !== opt);
                         handleFormChange('barterPrefs', newPrefs);
                       }}
                     />
                     <span className="text-sm font-medium text-[var(--text-primary)]">{opt}</span>
                   </label>
                 ))}
               </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Payment Timelines</label>
               <select 
                  value={formData.paymentTimeline}
                  onChange={e => handleFormChange('paymentTimeline', e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] text-[var(--text-primary)]"
                >
                  <option>Advance Payment</option>
                  <option>Within 7 Days</option>
                  <option>Within 30 Days</option>
                  <option>After Project Completion</option>
                </select>
            </div>
          </>
        );
      case 'qr_code': {
        const profileUrl = window.location.origin + "/creator/" + (user?.id || 'demo');
        const downloadQR = () => {
          const svg = document.getElementById("profile-qr-code");
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width; canvas.height = img.height;
            ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const downloadLink = document.createElement("a");
            downloadLink.download = `${profile.name}_qr.png`;
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.click();
            toast.success("QR Code downloaded!");
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        };

        return (
          <div className="flex flex-col items-center py-4">
            <h3 className="font-display font-bold text-xl mb-6 text-[var(--text-primary)] w-full">Your Profile QR</h3>
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
              <QRCodeSVG id="profile-qr-code" value={profileUrl} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6 text-center">Scan this code to view your Ybex Creator Profile.</p>
            <button onClick={downloadQR} className="w-full py-3 bg-[var(--violet)] hover:bg-[#6B4AFF] text-[var(--text-primary)] font-bold rounded-xl transition-all shadow-lg shadow-[#7C5CFF]/20 flex items-center justify-center gap-2">
              <Download size={18}/> Download QR Code
            </button>
          </div>
        );
      }
      case 'activeSessions':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--text-primary)]">Active Sessions</h3>
            <div className="space-y-3 mb-6">
              {activeSessionsList.map(session => (
                <div key={session.id} className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] text-sm">{session.name}</div>
                    <div className="text-[var(--text-secondary)] text-xs mt-1">{session.location} • {session.time}</div>
                  </div>
                  {session.isCurrent ? (
                    <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded">Current</div>
                  ) : (
                    <button onClick={() => handleLogoutSession(session.id)} className="text-red-500 text-xs font-semibold hover:underline">Log Out</button>
                  )}
                </div>
              ))}
              {activeSessionsList.length === 0 && (
                <div className="text-center text-[var(--text-secondary)] py-4 text-sm">No active sessions found.</div>
              )}
            </div>
            {activeSessionsList.length > 1 && (
              <button onClick={handleLogoutAllOtherSessions} className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold rounded-xl transition-all">
                Log out all other sessions
              </button>
            )}
          </>
        )
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 sm:py-10 animate-in fade-in slide-in-from-right-4 duration-300 relative pb-24" data-testid="settings-page">
      
      {/* MODAL OVERLAY */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-default)] w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
              >
                <button onClick={closeModal} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"><X size={20}/></button>
                
                {renderModalContent()}

                {['name', 'profession', 'language', 'location', 'phone', 'businessEmail', 'niche', 'socials', 'collabPrefs'].includes(activeModal) && (
                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={closeModal} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2">
                      {isSaving ? <><Loader2 size={18} className="animate-spin" /> {otpSent ? 'Updating...' : 'Sending...'}</> : 
                       (['phone', 'businessEmail'].includes(activeModal) && !otpSent) ? 'Send Verification Code' : 
                       (['phone', 'businessEmail'].includes(activeModal) && otpSent) ? 'Verify & Save' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* NEW PROFILE HEADER */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-2xl mb-8 relative">
        <div className="relative w-full h-32 md:h-48 group bg-[var(--bg-card)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/40 via-[#3B82F6]/20 to-[#D9F111]/10"></div>
          {/* Banner pattern or image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center md:bg-[center_top_-200px] opacity-30 mix-blend-overlay"></div>
          <button className="absolute top-4 right-4 bg-[var(--bg-elevated)] hover:bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-[var(--text-primary)] text-xs font-bold transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 z-10">
            <Camera size={14} /> Change Cover
          </button>
        </div>

        <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
            <div className="relative -mt-16 md:-mt-20 shrink-0 z-20">
               <img src={user?.avatar || "https://ui-avatars.com/api/?name="+encodeURIComponent(profile.name)+"&background=7C3AED&color=fff"} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[var(--bg-card)] object-cover bg-[var(--bg-card)]" alt="Avatar"/>
               <button className="absolute bottom-1 right-1 bg-[#D9F111] hover:bg-[#c4da0f] p-2 rounded-full text-black ring-4 ring-[var(--bg-card)] transition-transform hover:scale-105">
                  <Camera size={14} />
               </button>
            </div>
            <div className="mt-2 md:mt-0 flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                {profile.name} 
                {(kycObj?.status === "approved" || user?.verified) && <CheckCircle className="text-emerald-500" size={20} />}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-base mt-1 flex items-center gap-2">
                {profile.profession} <span className="w-1 h-1 rounded-full bg-white/20"></span> <MapPin size={14}/> {profile.location}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                 {profile.subCategories.length > 0 ? profile.subCategories.map(s => <span key={s} className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-xs text-[var(--text-primary)]/80">{s}</span>) : <span className="px-3 py-1 bg-[var(--violet)]/20 border border-[#7C3AED]/30 text-[var(--violet)] rounded-full text-xs">{profile.niche}</span>}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
              <button onClick={() => window.open(`/creator/${user?.id || 'demo'}`, '_blank')} className="flex-1 md:flex-none px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-sm font-semibold text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2">
                <Eye size={16} /> Public View
              </button>
              <button onClick={() => handleEdit('name')} className="flex-1 md:flex-none px-5 py-2.5 bg-[var(--violet)] hover:bg-[#6D28D9] shadow-[0_0_15px_rgba(124,58,237,0.3)] rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2">
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Settings & Details */}
        <div className="lg:col-span-2 space-y-8">
          
           {/* KYC WIDGET */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--violet)]/10 rounded-full filter blur-[80px] pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <span className={`p-3 rounded-2xl border shrink-0 ${
                (kycObj?.status === "approved" || user?.verified)
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm"
                  : kycObj?.status === "pending"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse shadow-sm"
                  : kycObj?.status === "rejected"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm"
                  : "bg-[var(--violet)]/10 text-[var(--violet)] border-[#7C3AED]/20 shadow-sm"
              }`}>
                <Shield size={22} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--text-primary)] font-sans">KYC Trust Verification</h2>
                  {(kycObj?.status === "approved" || user?.verified) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">Approved</span>
                  ) : kycObj?.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-bold animate-pulse">Under Review</span>
                  ) : kycObj?.status === "rejected" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">Action Required</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-tertiary)] font-bold">Required</span>
                  )}
                </div>
                
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed font-medium">
                  {(kycObj?.status === "approved" || user?.verified)
                    ? "Your document credentials are confirmed. Settlement routes are mapped."
                    : "Enter government identity number and settlement account to verify profile legitimacy."}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowKycVerificationModal(true)}
              className={`px-5 py-2.5 cursor-pointer rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap text-black ${
                (kycObj?.status === "approved" || user?.verified)
                  ? "bg-[#10B981] hover:bg-emerald-500 shadow-lg shadow-emerald-500/15 text-[var(--text-primary)]"
                  : kycObj?.status === "pending"
                  ? "bg-yellow-500 hover:bg-yellow-400"
                  : "bg-[#D9F111] hover:bg-[#c4da0f] shadow-lg shadow-[#D9F111]/15 hover:-translate-y-0.5"
              }`}
            >
              {(kycObj?.status === "approved" || user?.verified)
                ? "View Verified Badges"
                : kycObj?.status === "pending"
                ? "Check Portal Status"
                : "Complete KYC Portal"}
            </button>
          </div>
          
          <KycVerificationModal 
            isOpen={showKycVerificationModal} 
            onClose={() => {
              setShowKycVerificationModal(false);
              fetchKycStatus();
            }} 
            onComplete={() => {
              fetchKycStatus();
              if (refreshUser) refreshUser();
            }}
          />

          {/* BASIC INFO */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
               <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider flex items-center gap-2">
                 <User size={16} className="text-[var(--text-secondary)]" /> Profile Information
               </h2>
               <button onClick={() => handleEdit('name')} className="text-xs font-bold text-[var(--violet)] hover:text-[#6D28D9] flex items-center gap-1">
                 <Edit2 size={12}/> EDIT ALL
               </button>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl flex flex-col overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-white/5">
                 <EditableRow icon={Briefcase} label="Profession" value={profile.profession} onEdit={() => handleEdit('profession')} border className="md:border-r border-[var(--border-default)] md:border-b border-b-white/5" />
                 <EditableRow icon={MessageSquare} label="Primary Language" value={profile.language} onEdit={() => handleEdit('language')} border className="md:border-b border-b-white/5" />
                 <EditableRow icon={MapPin} label="Current Location" value={profile.location} onEdit={() => handleEdit('location')} border className="md:border-r border-[var(--border-default)]" />
                 <div className="flex items-center justify-between px-6 py-5 border-t md:border-t-0 border-[var(--border-default)]">
                  <div className="flex gap-4">
                    <div className="mt-0.5"><Grid size={20} className="text-[var(--text-secondary)]" /></div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] text-sm">Primary Niche</div>
                      <div className="text-[#10B981] text-sm mt-0.5 font-medium">{profile.niche}</div>
                    </div>
                  </div>
                  <button onClick={() => handleEdit('niche')} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)] transition-colors bg-[var(--bg-elevated)]"><Edit2 size={14}/></button>
                </div>
              </div>
            </div>
          </section>

          {/* PARTNERSHIP STRATEGY */}
          <section>
             <div className="flex items-center justify-between mb-4 px-1">
               <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider flex items-center gap-2">
                 <Package size={16} className="text-[var(--text-secondary)]" /> Collaboration Terms
               </h2>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl flex flex-col overflow-hidden p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] mb-2">Preferred Barter & Exchanges</div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {profile.barterPrefs.map(b => (
                        <span key={b} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]/80 border border-[var(--border-default)] px-3 py-1.5 rounded-lg text-xs font-medium">{b}</span>
                      ))}
                    </div>
                    
                    <div className="font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2"><Calendar size={14} className="text-[var(--text-secondary)]"/> Standard Payment Timeline</div>
                    <div className="text-[var(--text-secondary)] text-sm bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-default)] inline-block">
                       {profile.paymentTimeline}
                    </div>
                  </div>
                  <button onClick={() => handleEdit('collabPrefs')} className="shrink-0 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-xl text-[var(--text-primary)] font-semibold text-sm transition-colors border border-[var(--border-default)] flex items-center justify-center gap-2">
                    <Edit2 size={14}/> Manage
                  </button>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN - Socials, Security, Actions */}
        <div className="space-y-8">
           
           {/* GROWTH & SHARING */}
           <section>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider mb-4 px-1 flex items-center gap-2">
               <Share2 size={16} className="text-[var(--text-secondary)]" /> Share Profile
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleEdit('qr_code')} className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#7C3AED]/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all group">
                <div className="w-10 h-10 rounded-t-[14px] rounded-bl-[14px] rounded-br-[4px] bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center group-hover:bg-[var(--violet)] transition-all">
                  <Grid size={20} className="group-hover:anim-jiggle" />
                </div>
                <span className="font-medium text-xs text-[var(--text-primary)]">QR Code</span>
              </button>
              <button 
                onClick={() => { navigator.clipboard.writeText(window.location.origin + "/creator/demo"); toast.success("Profile link copied!"); }}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#D9F111]/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-10 h-10 rounded-t-[14px] rounded-bl-[14px] rounded-br-[4px] bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center group-hover:bg-[#D9F111] group-hover:text-black transition-all">
                  <LinkIcon size={20} className="group-hover:anim-jiggle" />
                </div>
                <span className="font-medium text-xs text-[var(--text-primary)]">Copy Link</span>
              </button>
            </div>
          </section>

          {/* MY SOCIALS */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
               <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider flex items-center gap-2">
                 <Globe size={16} className="text-[var(--text-secondary)]" /> Connected Socials
               </h2>
               <button onClick={() => handleEdit('socials')} className="text-[var(--violet)] p-1.5 hover:bg-[var(--violet)]/10 rounded-lg transition-colors"><Edit2 size={14}/></button>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-3 space-y-2">
              {profile.socials.map((social, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)]">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                       {social.platform === 'Instagram' && <Instagram size={14} className="text-pink-500" />}
                       {social.platform === 'YouTube' && <Youtube size={14} className="text-red-500" />}
                       {social.platform === 'Twitter' && <Twitter size={14} className="text-blue-400" />}
                       {social.platform === 'LinkedIn' && <Linkedin size={14} className="text-blue-600" />}
                       {!['Instagram', 'YouTube', 'Twitter', 'LinkedIn'].includes(social.platform) && <Globe size={14} className="text-[var(--text-secondary)]" />}
                     </div>
                     <span className="text-sm font-semibold text-[var(--text-primary)]">{social.platform}</span>
                   </div>
                   <div className="text-xs text-[var(--text-secondary)] truncate max-w-[100px]">{social.url.replace('https://','')}</div>
                 </div>
              ))}
              <button onClick={() => handleEdit('socials')} className="w-full py-3 mt-2 rounded-2xl border border-dashed border-[var(--border-default)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] hover:border-white/30 transition-all flex items-center justify-center gap-2">
                 <Plus size={14} /> Add Social Link
              </button>
            </div>
          </section>

          {/* SECURITY & ACCESS */}
          <section>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wider mb-4 px-1 flex items-center gap-2">
               <Shield size={16} className="text-[var(--text-secondary)]" /> Security & Access
            </h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl flex flex-col overflow-hidden">
               <EditableRow icon={Smartphone} label="Phone Number" value={profile.phone} onEdit={() => handleEdit('phone')} border />
               <EditableRow icon={Mail} label="Business Email" value={profile.businessEmail} onEdit={() => handleEdit('businessEmail')} border />
               <EditableRow icon={MonitorSmartphone} label="Active Sessions" value="2 active devices" onEdit={() => handleEdit('activeSessions')} />
            </div>
          </section>

          <button onClick={logout} className="w-full bg-[var(--bg-card)] hover:bg-rose-500/10 border border-[var(--border-default)] hover:border-rose-500/30 text-rose-500 font-bold rounded-2xl py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2"><LogOut size={16}/> Log out of account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableRow({ icon: Icon, label, value, onEdit, border, className = "" }) {
  return (
    <div className={`flex items-center justify-between px-6 py-5 ${border ? 'border-b border-[var(--border-default)]' : ''} ${className}`}>
      <div className="flex gap-4">
        <div className="mt-0.5"><Icon size={20} className="text-[var(--text-secondary)]" /></div>
        <div>
          <div className="font-semibold text-[var(--text-primary)] text-sm">{label}</div>
          <div className="text-[var(--text-secondary)] text-xs mt-1">{value}</div>
        </div>
      </div>
      <button onClick={onEdit} className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)] transition-colors">
        <Edit2 size={14}/>
      </button>
    </div>
  );
}
