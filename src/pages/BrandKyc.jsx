import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import KYCStatusBanner from "../components/KYCStatusBanner";
import { Check, ShieldCheck, Mail, Phone, Globe, Building, CreditCard, User, Landmark, UploadCloud } from "lucide-react";

export default function BrandKyc() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [gstCert, setGstCert] = useState("");
  const [brandPan, setBrandPan] = useState("");
  const [incProof, setIncProof] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocDesignation, setPocDesignation] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  const loadKyc = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/verifications/me").catch(() => ({ data: null }));
      if (data) {
        setKycStatus(data);
        if (data.status === "approved" || data.status === "APPROVED") {
          toast.info("Your KYC is already Approved!");
          navigate("/dashboard");
          return;
        }
        // Prefill if pending/rejected
        const docs = data.documents || {};
        setGstCert(docs.gst_cert || "");
        setBrandPan(docs.brand_pan || "");
        setIncProof(docs.incorporation_proof || "");
        setPocName(docs.poc_name || "");
        setPocDesignation(docs.poc_designation || "");
        setPocEmail(docs.poc_email || "");
        setPocPhone(docs.poc_phone || "");
        setSiteUrl(docs.website || "");
      }
    } catch (e) {
      console.warn("KYC Status empty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gstCert.trim() || gstCert.length < 15) {
      toast.error("Please enter a valid 15-digit GSTIN credential.");
      return;
    }
    if (!brandPan.trim() || brandPan.length < 10) {
      toast.error("Please enter a valid Permanent Account Number (PAN) detail.");
      return;
    }
    if (!pocName.trim()) {
      toast.error("Authorized Representative Name is required.");
      return;
    }
    if (!pocEmail.trim()) {
      toast.error("Authorized corporate communication email is required.");
      return;
    }

    try {
      setSubmitting(true);
      const docsObj = {
        gst_cert: gstCert,
        brand_pan: brandPan,
        incorporation_proof: incProof || "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=300",
        poc_name: pocName,
        poc_designation: pocDesignation,
        poc_email: pocEmail,
        poc_phone: pocPhone,
        website: siteUrl,
        uploaded_files: []
      };

      await api.post("/verifications/request", {
        documents: docsObj,
        note: `KYC document submitted via full-page form by brand user ${user?.name}`
      });

      toast.success("Compliance documents successfully submitted for verification!");
      if (refreshUser) await refreshUser();
      await loadKyc();
    } catch (err) {
      toast.error("Compliance request failed. Review validation requirements and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 bg-[var(--bg-base)] min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin"></div>
          <div className="text-[var(--text-tertiary)] text-sm font-mono tracking-widest uppercase">Loading Compliance Panel...</div>
        </div>
      </div>
    );
  }

  const isLocked = kycStatus?.status === "pending" || kycStatus?.status === "PENDING" || kycStatus?.status === "UNDER_REVIEW";

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-8 py-10 text-left min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            Compliance Validation Center
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-[var(--violet)]/20 text-[#a98eff] border border-[var(--violet)]/20 rounded-full flex items-center gap-1">
            <ShieldCheck size={12} /> Secure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
          Verify your business information to activate premium campaign postings, escrow protections, and real payouts.
        </p>
      </div>

      <KYCStatusBanner 
        status={kycStatus?.status} 
        rejectReason={kycStatus?.rejected_reason || kycStatus?.note} 
      />

      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--violet)]/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Corporate Details */}
          <div>
            <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2 mb-6">
              <Building size={16} className="text-[var(--violet)]" />
              <h3 className="text-xs font-display font-extrabold text-[var(--text-primary)]/90 uppercase tracking-widest">
                Business & Corporate Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Brand GSTIN Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[var(--text-tertiary)]"><Landmark size={16} /></span>
                  <input
                    disabled={isLocked}
                    value={gstCert}
                    onChange={(e) => setGstCert(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)] placeholder-white/30 uppercase"
                    type="text"
                    required
                    maxLength={15}
                    placeholder="27AAAAA1111A1Z1"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] block mt-1.5 leading-relaxed">
                  Enter 15-character Goods & Services Tax identification number
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Brand Corporate PAN *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[var(--text-tertiary)]"><CreditCard size={16} /></span>
                  <input
                    disabled={isLocked}
                    value={brandPan}
                    onChange={(e) => setBrandPan(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)] placeholder-white/30 uppercase"
                    type="text"
                    required
                    maxLength={10}
                    placeholder="ABCDE1234F"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] block mt-1.5 leading-relaxed">
                  Enter 10-character Permanent Account Number registered directly with IT Department
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Representative Info */}
          <div>
            <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2 mb-6">
              <User size={16} className="text-[var(--violet)]" />
              <h3 className="text-xs font-display font-extrabold text-[var(--text-primary)]/90 uppercase tracking-widest">
                Authorized Corporate Liaison Web
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Primary representative full name *
                </label>
                <input
                  disabled={isLocked}
                  value={pocName}
                  onChange={(e) => setPocName(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)]"
                  type="text"
                  required
                  placeholder="Karan Johar"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Representative Designative Position
                </label>
                <input
                  disabled={isLocked}
                  value={pocDesignation}
                  onChange={(e) => setPocDesignation(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)]"
                  type="text"
                  placeholder="Marketing Director / Partnership Head"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Authorized Corporate Email ID *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[var(--text-tertiary)]"><Mail size={16} /></span>
                  <input
                    disabled={isLocked}
                    value={pocEmail}
                    onChange={(e) => setPocEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)] placeholder-white/20"
                    type="email"
                    required
                    placeholder="partnerships@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Direct Liaison Phone
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[var(--text-tertiary)]"><Phone size={16} /></span>
                  <input
                    disabled={isLocked}
                    value={pocPhone}
                    onChange={(e) => setPocPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)] placeholder-white/20"
                    type="tel"
                    placeholder="+91 99999 55555"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Web details */}
          <div>
            <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2 mb-6">
              <Globe size={16} className="text-[var(--violet)]" />
              <h3 className="text-xs font-display font-extrabold text-[var(--text-primary)]/90 uppercase tracking-widest">
                Business landing link & Uploads
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Official Landing Website URL
                </label>
                <input
                  disabled={isLocked}
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors focus:ring-2 focus:ring-[#7C5CFF]/10 text-[var(--text-primary)] placeholder-white/20"
                  type="url"
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">
                  Incorporation Certificate Proof (Optional PDF/JPG URL)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[var(--text-tertiary)]"><UploadCloud size={16} /></span>
                  <input
                    disabled={isLocked}
                    value={incProof}
                    onChange={(e) => setIncProof(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] outline-none shadow-sm transition-colors text-[var(--text-primary)] placeholder-white/20"
                    type="text"
                    placeholder="https://bucket.com/proof.pdf"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            {!isLocked ? (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-bold bg-[var(--violet)] hover:bg-[#6B4AFF] text-[var(--text-primary)] shadow-xl transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting KYC...
                  </>
                ) : (
                  <>
                    Submit Credentials <Check size={16} />
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg">
                ⚠️ Form locked: Compliance validation underway. No changes allowed during review queue.
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
