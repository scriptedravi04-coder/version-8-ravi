import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Fingerprint, CreditCard, Building2, AlertTriangle, Check, ArrowLeft, FileText, PauseCircle, Clock } from 'lucide-react';
import CreatorKYCReview from './CreatorKYCReview';
import { api } from '../../lib/api';

export default function KYCManager() {
  const [activeId, setActiveId] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [tab, setTab] = useState("Creator"); // 'Creator' or 'Brand'

  useEffect(() => {
    fetchVerifications();
  }, [activeId]);

  const fetchVerifications = async () => {
    try {
      const res = await api.get("/admin/verifications");
      setVerifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const activeUser = verifications.find(v => v.verification_id === activeId);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/verifications/${id}/approve`);
      setVerifications(prev => prev.map(v => v.verification_id === id ? { ...v, status: 'approved' } : v));
      setActiveId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id, rejectReason) => {
    try {
      if (rejectReason === "Escalated to Fraud Team") {
        await api.post(`/admin/verifications/${id}/escalate`, { note: rejectReason });
        setVerifications(prev => prev.map(v => v.verification_id === id ? { ...v, status: 'escalated' } : v));
      } else {
        await api.post(`/admin/verifications/${id}/reject`, { reason: rejectReason });
        setVerifications(prev => prev.map(v => v.verification_id === id ? { ...v, status: 'rejected' } : v));
      }
      setActiveId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (activeUser) {
    if (activeUser.type === "Brand") {
       return <BrandKYCDetail user={activeUser} onBack={() => setActiveId(null)} onApprove={handleApprove} onReject={handleReject} />;
    }
    return <CreatorKYCReview creator={activeUser} onBack={() => setActiveId(null)} onApprove={handleApprove} onReject={handleReject} />;
  }

  const displayedList = verifications.filter(v => v.type === tab);

  return (
    <div className="space-y-6">
       <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl w-max border border-[var(--border-default)]">
          {["Creator", "Brand"].map(t => (
             <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-[#9D7CFF] text-[var(--text-primary)] shadow-md' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]'}`}
             >
                {t} Verifications
             </button>
          ))}
       </div>

       <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-[var(--text-secondary)] border-b border-[var(--border-default)] bg-foreground/5">
                   <tr>
                      <th className="px-6 py-4 font-medium tracking-wider">User</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Submitted On</th>
                      <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                   {displayedList.length === 0 && (
                     <tr><td colSpan="4" className="px-6 py-8 text-center text-[var(--text-secondary)] italic">No {tab.toLowerCase()} verifications found.</td></tr>
                   )}
                   {displayedList.map(v => (
                      <tr key={v.verification_id} className="hover:bg-foreground/5 transition-colors group">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                               <img src={v.photo} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                               <div>
                                  <div className="font-semibold">{v.name}</div>
                                  <div className="text-xs text-[var(--text-secondary)]">{v.type}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            {v.status === 'approved' && <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-md text-xs font-medium">Approved</span>}
                            {v.status === 'rejected' && <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded-md text-xs font-medium">Rejected</span>}
                            {v.status === 'escalated' && <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-md text-xs font-medium flex items-center w-max gap-1">🚨 Escalated (Fraud)</span>}
                            {v.status === 'pending' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md text-xs font-medium flex items-center w-max gap-1"><Clock size={12}/> Pending</span>}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">
                            {new Date(v.created_at).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button onClick={() => setActiveId(v.verification_id)} className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg font-medium text-xs transition-colors">
                               Review Documents
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}

function BrandKYCDetail({ user, onBack, onApprove, onReject }) {
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [status, setStatus] = useState(user.status === 'approved' ? 'Verified' : user.status === 'rejected' ? 'Suspended' : 'Pending Review');
  const [checks, setChecks] = useState({
     gstin: false,
     panMatch: false,
     addressProof: false
  });

  const toggleCheck = (k) => setChecks(p => ({...p, [k]: !p[k]}));

  return (
    <div className="w-full max-w-5xl space-y-6">
       <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 p-2 hover:bg-foreground/5 rounded-lg transition-colors">
             <ArrowLeft size={18} /> <span className="text-sm font-medium">Back to Verifications</span>
          </button>
       </div>

       {/* Banner */}
       <div className={`p-4 rounded-xl border flex items-center justify-between ${status === 'Pending Review' ? 'bg-amber-500/10 border-amber-500/30' : status === 'Verified' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-3">
             {status === 'Pending Review' && <Clock className="text-amber-500" />}
             {status === 'Verified' && <CheckCircle2 className="text-green-500" />}
             {status === 'Suspended' && <AlertTriangle className="text-red-500" />}
             <div>
                <div className={`font-bold ${status === 'Pending Review' ? 'text-amber-500' : status === 'Verified' ? 'text-green-500' : 'text-red-500'}`}>
                   {status}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Current Brand Verification Status</div>
             </div>
          </div>
          <div className="text-right flex flex-col gap-1 items-end">
             <div className="text-xs text-[var(--text-secondary)] border border-[var(--border-default)] px-2 py-1 rounded bg-[var(--bg-elevated)]">Status updated today by Admin</div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                   <img src={user.photo} alt={user.name} className="w-16 h-16 rounded-xl border border-[var(--border-default)]" />
                   <div>
                      <h2 className="font-display font-semibold text-2xl">{user.name}</h2>
                      <div className="text-sm text-[var(--text-secondary)]">Company Profile</div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                   {(user.documents?.gst_cert || user.gstin) && (
                     <div>
                        <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1 block">GSTIN</label>
                        <div className="font-mono text-sm bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-foreground/5">{user.documents?.gst_cert || user.gstin}</div>
                     </div>
                   )}
                   {user.documents?.brand_pan && (
                     <div>
                        <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1 block">Company PAN</label>
                        <div className="font-mono text-sm bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-foreground/5">{user.documents?.brand_pan}</div>
                     </div>
                   )}
                   {user.documents?.website && (
                     <div className="col-span-2">
                        <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1 block">Website / Address</label>
                        <div className="text-sm bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-foreground/5">{user.documents?.website}</div>
                     </div>
                   )}
                   {(user.documents?.poc_name || user.name) && (
                     <div className="col-span-2">
                        <label className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-1 block">Authorized Signatory Name</label>
                        <div className="text-sm bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-foreground/5">{user.documents?.poc_name || user.name}</div>
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><FileText size={18} className="text-[#9D7CFF]"/> Uploaded Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {user.documents?.uploaded_files && user.documents.uploaded_files.length > 0 ? (
                      user.documents.uploaded_files.map((file, idx) => {
                         const url = file.url || file;
                         const name = file.name || `Document ${idx + 1}`;
                         return (
                            <a 
                               href={url} 
                               target="_blank" 
                               rel="noreferrer" 
                               key={idx} 
                               className="border border-[var(--border-default)] rounded-xl p-4 flex items-start gap-4 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[72px]"
                            >
                               <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0">
                                  <FileText size={20} className="text-[var(--text-secondary)]" />
                               </div>
                               <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate" title={name}>{name}</div>
                                  <div className="text-xs text-[#9D7CFF] mt-1 font-semibold">View Attachment ↗</div>
                                </div>
                            </a>
                         );
                      })
                   ) : (
                      <div className="col-span-2 py-4 text-center text-[var(--text-secondary)] text-sm">
                         No additional documents uploaded.
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9D7CFF]/5 blur-3xl rounded-full"></div>
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><ShieldCheck className="text-[#9D7CFF]" size={20}/> Verification Protocol</h3>
                
                <div className="space-y-4 mb-8">
                   {[
                      { id: 'gstin', label: 'GSTIN Registration Validated' },
                      { id: 'panMatch', label: 'PAN Identity Match' },
                      { id: 'addressProof', label: 'Address & Locality Verified' }
                   ].map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleCheck(item.id)}
                        className={`group relative overflow-hidden cursor-pointer rounded-xl border flex items-center gap-4 p-4 transition-all duration-300 ${checks[item.id] ? 'bg-[#9D7CFF]/10 border-[#9D7CFF]/40 text-[var(--text-primary)]' : 'bg-foreground/5 border-transparent text-[var(--text-primary)]/60 hover:bg-foreground/10'}`}
                      >
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${checks[item.id] ? 'bg-[#9D7CFF] text-[var(--text-primary)]' : 'bg-foreground/10 text-transparent group-hover:bg-foreground/20'}`}>
                            <Check size={14} className="stroke-[3]" />
                         </div>
                         <div className="text-sm font-semibold">{item.label}</div>
                         {checks[item.id] && <div className="ml-auto text-[10px] uppercase tracking-wider text-[#9D7CFF] font-bold">Passed</div>}
                      </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-[var(--border-default)]">
                   <p className="text-xs text-[var(--text-secondary)] mb-4 text-center">Ensure all protocol steps are verified before approval.</p>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setSuspendModal(true)}
                        className="w-full flex justify-center items-center gap-2 py-3.5 bg-foreground/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 hover:text-red-500 font-semibold rounded-xl transition-all duration-300"
                      >
                         <XCircle size={18} /> Reject
                      </button>
                      <button 
                        onClick={async () => {
                           await onApprove(user.verification_id);
                           setStatus("Verified");
                        }}
                        className={`w-full flex justify-center items-center gap-2 py-3.5 font-bold rounded-xl transition-all duration-300 ${checks.gstin && checks.panMatch && checks.addressProof ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:opacity-90' : 'bg-foreground/10 text-[var(--text-tertiary)] cursor-not-allowed'}`}
                        disabled={!(checks.gstin && checks.panMatch && checks.addressProof)}
                      >
                         <CheckCircle2 size={18} /> Approve
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {suspendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSuspendModal(false)}>
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-display text-xl font-bold text-red-500 mb-4 flex items-center gap-2"><AlertTriangle size={20}/> Suspend Brand Account</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Please provide a reason for suspension. The brand will be notified.</p>
                
                <select 
                   value={suspendReason} 
                   onChange={e => setSuspendReason(e.target.value)}
                   className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 mb-4 text-sm focus:outline-none focus:border-red-500"
                >
                   <option value="" disabled>Select reason...</option>
                   <option value="Incomplete Documents">Incomplete Documents</option>
                   <option value="Suspicious GSTIN / PAN">Suspicious GSTIN / PAN</option>
                   <option value="Blacklisted Entity">Blacklisted Entity</option>
                   <option value="Other">Other</option>
                </select>

                <div className="flex gap-3 justify-end mt-6">
                   <button onClick={() => setSuspendModal(false)} className="px-4 py-2 text-sm font-medium hover:text-[var(--text-primary)] text-[var(--text-primary)]/60">Cancel</button>
                   <button 
                     disabled={!suspendReason}
                     onClick={async () => {
                        await onReject(user.verification_id, suspendReason);
                        setStatus("Suspended");
                        setSuspendModal(false);
                     }}
                     className="px-4 py-2 bg-red-500 hover:bg-red-600 text-[var(--text-primary)] font-bold rounded-xl text-sm disabled:opacity-50"
                   >
                      Confirm Suspension
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}

function CreatorKYCDetail({ user, onBack }) {
  const [panStatus, setPanStatus] = useState('verified'); // verified, pending, failed
  const [aadhaarStatus, setAadhaarStatus] = useState('verified');
  const [bankStatus, setBankStatus] = useState('failed');
  const [loading, setLoading] = useState(null);

  const overallStatus = (panStatus === 'verified' && aadhaarStatus === 'verified' && bankStatus === 'verified') 
    ? "Verified" 
    : (panStatus === 'failed' || aadhaarStatus === 'failed' || bankStatus === 'failed') ? "Failed" : "Partial";

  const reverify = (type) => {
    setLoading(type);
    setTimeout(() => {
      if (type === 'pan') setPanStatus('verified');
      if (type === 'aadhaar') setAadhaarStatus('verified');
      if (type === 'bank') setBankStatus('verified');
      setLoading(null);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] text-sm font-medium flex items-center gap-2">
          &larr; Back to List
        </button>
        <div className="flex items-center gap-2">
           <span className="text-sm font-medium text-[var(--text-primary)]/60">Overall Status:</span>
           {overallStatus === 'Verified' && <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold uppercase">Verified</span>}
           {overallStatus === 'Partial' && <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase">Partial</span>}
           {overallStatus === 'Failed' && <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold uppercase">Failed</span>}
        </div>
      </div>

      <div className="space-y-4">
        {/* PAN Card */}
        <VerificationCard 
          icon={<CreditCard />}
          title="PAN Verification"
          status={panStatus}
          loading={loading === 'pan'}
          onReverify={() => reverify('pan')}
          lastChecked="Today, 10:45 AM"
        >
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">PAN Number</div>
               <div className="font-mono">ABCDE1234F</div>
             </div>
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Name Match</div>
               <div className="flex items-center gap-1 text-green-400 font-medium"><CheckCircle2 size={16}/> 98% Match</div>
             </div>
             <div className="col-span-2">
               <div className="text-[var(--text-secondary)] text-xs mb-1">API Status</div>
               <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-foreground/10 text-xs text-[var(--text-secondary)] font-mono">
                  <ShieldCheck size={14} className="text-[#9D7CFF]"/> NSDL Verified
               </div>
             </div>
          </div>
        </VerificationCard>

        {/* Aadhaar */}
        <VerificationCard 
          icon={<Fingerprint />}
          title="Aadhaar Verification"
          status={aadhaarStatus}
          loading={loading === 'aadhaar'}
          onReverify={() => reverify('aadhaar')}
          lastChecked="Today, 10:46 AM"
        >
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Aadhaar Number</div>
               <div className="font-mono">XXXX-XXXX-1234</div>
             </div>
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Consent</div>
               <div className="flex items-center gap-1 text-green-400 font-medium"><CheckCircle2 size={16}/> Provided</div>
             </div>
             <div className="col-span-2">
               <div className="text-[var(--text-secondary)] text-xs mb-1">Method</div>
               <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-semibold">
                  <Check size={14} /> OTP Verified
               </div>
             </div>
          </div>
        </VerificationCard>

        {/* Bank */}
        <VerificationCard 
          icon={<Building2 />}
          title="Bank Account Verification"
          status={bankStatus}
          loading={loading === 'bank'}
          onReverify={() => reverify('bank')}
          lastChecked="Today, 10:47 AM"
        >
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Account Number</div>
               <div className="font-mono">9876543210123</div>
             </div>
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">IFSC</div>
               <div className="font-mono text-[var(--text-primary)]/80">SBIN0001234</div>
             </div>
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Beneficiary Name</div>
               {bankStatus === 'failed' ? (
                 <div className="flex items-center gap-1 text-red-400 font-medium"><XCircle size={16}/> Mismatch Alert</div>
               ) : (
                 <div className="flex items-center gap-1 text-green-400 font-medium"><CheckCircle2 size={16}/> Rahul V.</div>
               )}
             </div>
             <div>
               <div className="text-[var(--text-secondary)] text-xs mb-1">Penny Drop</div>
               {bankStatus === 'failed' ? (
                 <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">
                    <AlertTriangle size={14}/> Failed
                 </div>
               ) : (
                 <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-semibold">
                    <Check size={14}/> Successful (₹1.00)
                 </div>
               )}
             </div>
          </div>
        </VerificationCard>
      </div>

      <div className="mt-8 flex justify-end pt-6 border-t border-[var(--border-default)]">
         <button 
           disabled={overallStatus !== 'Verified'}
           className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${overallStatus === 'Verified' ? 'bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-500/20' : 'bg-foreground/5 text-[var(--text-tertiary)] cursor-not-allowed'}`}
         >
           <CheckCircle2 size={20} /> Mark as Fully Verified
         </button>
      </div>
    </div>
  );
}

function VerificationCard({ icon, title, status, loading, onReverify, lastChecked, children }) {
  return (
    <div className={`bg-[var(--bg-card)]/50 border rounded-2xl p-5 relative overflow-hidden transition-colors ${status === 'verified' ? 'border-green-500/30' : status === 'failed' ? 'border-red-500/30' : 'border-[var(--border-default)]'}`}>
       <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'verified' ? 'bg-green-500/10 text-green-500' : status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-foreground/10 text-[var(--text-primary)]/60'}`}>
                {icon}
             </div>
             <h3 className="font-semibold font-display text-lg tracking-tight">{title}</h3>
          </div>
          <button 
             onClick={onReverify} 
             disabled={loading}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-black/60 border border-[var(--border-default)] rounded-lg text-xs font-medium transition-colors"
          >
             <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Checking..." : "Re-verify"}
          </button>
       </div>
       
       {children}

       <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between text-xs">
          <span className="text-[var(--text-tertiary)]">Last check: {lastChecked}</span>
       </div>
    </div>
  );
}
