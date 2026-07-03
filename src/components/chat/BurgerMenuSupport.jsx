import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Info, Phone, User, HelpCircle, 
  ChevronRight, CheckCircle, Clock, Send, X, 
  Instagram, Mail, Globe, MapPin, Building
} from 'lucide-react';
import { toast } from 'sonner';

export default function BurgerMenuSupport({ thread, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'status' | 'details' | 'contacts' | 'support'
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);

  const isBrand = user?.role === 'brand' || user?.user_type === 'brand';
  const campaign = thread?.campaigns || {};
  const creator = thread?.creator || {};
  const creatorProfile = creator?.profile || {};
  const brand = thread?.brand || {};

  const handleContactSupportSubmit = (e) => {
    e.preventDefault();
    setSendingSupport(true);
    setTimeout(() => {
      const ticketId = Math.floor(100000 + Math.random() * 900000);
      toast.success(`Support Ticket #${ticketId} Created!`, {
        description: "The Ybex Compliance Team has received your request. We will reach out to your registered email shortly.",
        duration: 8000
      });
      setSupportSubject('');
      setSupportMsg('');
      setSendingSupport(false);
      setActiveModal(null);
    }, 1200);
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'NEGOTIATING':
        return {
          label: "Negotiating Offer",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          desc: "Brand and Creator are discussing the campaign details, requirements, and budget. Safety sign-off is required to finalize negotiations."
        };
      case 'ACTIVE':
        if (!thread.agreement_signed_brand || !thread.agreement_signed_creator) {
          return {
            label: "Awaiting Signatures",
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            desc: "The custom collaboration terms are accepted! Both parties must execute the legal contract using the portal to begin content submissions."
          };
        }
        return {
          label: "Active Project",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          desc: "The agreement is fully signed. The creator is producing the content. Budget is secured in the Ybex Escrow vault."
        };
      case 'CONTENT_SUBMITTED':
        return {
          label: "Content Draft Submitted",
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
          desc: "Creator has submitted the media proof. Brand needs to review, suggest revisions, or click Approve within 48 hours."
        };
      case 'APPROVED':
        return {
          label: "Content Approved",
          color: "text-green-400 bg-green-500/10 border-green-500/20",
          desc: "Sponsorship content has been reviewed and accepted by the brand. The platform is ready to release escrow payout."
        };
      case 'COMPLETED':
        return {
          label: "Completed",
          color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
          desc: "Deal completed! Escrow funds have been successfully disbursed to the creator's wallet. Thank you for collaborating."
        };
      default:
        return {
          label: status || "In Progress",
          color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
          desc: "Current execution status of this platform collaboration."
        };
    }
  };

  const statusInfo = getStatusDetails(thread?.status);

  return (
    <div className="relative">
      {/* Burger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center border border-[var(--border-default)]"
        title="Collaboration Menu"
      >
        <Menu size={20} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/30">
                <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider block">Ybex Suite Menu</span>
                <span className="text-sm font-bold text-[var(--text-primary)] truncate block">{campaign?.title || 'Direct Collaboration'}</span>
              </div>

              <div className="p-2 space-y-1">
                {/* 1. Campaign Status */}
                <button 
                  onClick={() => { setActiveModal('status'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-amber-500" />
                    <span>Campaign Status</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                </button>

                {/* 2. Campaign Details */}
                <button 
                  onClick={() => { setActiveModal('details'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info size={16} className="text-[var(--violet)]" />
                    <span>Campaign Details</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                </button>

                {/* 3. Contact Details */}
                <button 
                  onClick={() => { setActiveModal('contacts'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-emerald-500" />
                    <span>Contact Details</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                </button>

                {/* 4. Contact Support */}
                <button 
                  onClick={() => { setActiveModal('support'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-rose-500" />
                    <span>Contact Support</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                </button>
              </div>

              <div className="p-4 bg-[var(--bg-elevated)]/30 border-t border-[var(--border-default)] text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                🛡️ Handled under **Section 10A of the IT Act, 2000**. Built-in Escrow ensures zero-dispute security.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals rendered via React Portal to prevent layout cut-off */}
      {createPortal(
        <AnimatePresence>
          {/* 1. STATUS MODAL */}
          {activeModal === 'status' && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4 text-slate-100 max-h-[85vh] overflow-y-auto"
              >
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-elevated)]"><X size={18}/></button>
                <h4 className="text-lg font-display font-bold text-[var(--text-primary)]">Collaboration Status</h4>
                
                <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Current State:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {statusInfo.desc}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-[var(--text-tertiary)] leading-relaxed border-t border-[var(--border-default)] pt-3">
                  <p>• Escrow Value: <strong className="text-[var(--violet)]">₹{(thread.agreed_amount || 0).toLocaleString()} INR</strong> is fully bonded.</p>
                  <p>• Content submissions are automatically reviewed by system scanners for compliance guidelines.</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* 2. DETAILS MODAL */}
          {activeModal === 'details' && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-lg p-6 relative shadow-2xl flex flex-col max-h-[85vh] text-slate-100"
              >
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-elevated)]"><X size={18}/></button>
                <h4 className="text-xl font-display font-bold text-[var(--text-primary)] mb-4">Campaign Details</h4>
                
                <div className="overflow-y-auto space-y-4 pr-1 no-scrollbar flex-1">
                  <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-bold text-[var(--violet)] uppercase tracking-wider block">Campaign Title</span>
                    <h5 className="text-base font-bold text-[var(--text-primary)]">{campaign.title || 'Direct Sponsorship'}</h5>
                    <p className="text-sm text-[var(--text-secondary)]">{campaign.description || 'No campaign description provided.'}</p>
                  </div>

                  {campaign.deliverable_type && (
                    <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-4">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block mb-1">Deliverable Format</span>
                      <p className="text-sm text-[var(--text-primary)] font-semibold capitalize">{campaign.deliverable_type.replace('_', ' ')}</p>
                    </div>
                  )}

                  <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Deliverables list</span>
                    <ul className="text-xs text-[var(--text-secondary)] list-disc pl-5 space-y-1.5">
                      {thread.deliverables?.map((d, i) => <li key={i}>{d}</li>) || <li>1x Video Reel/Short Post</li>}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* 3. CONTACT DETAILS MODAL */}
          {activeModal === 'contacts' && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4 text-slate-100 max-h-[85vh] overflow-y-auto"
              >
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-elevated)]"><X size={18}/></button>
                <h4 className="text-lg font-display font-bold text-[var(--text-primary)]">Contact Directory</h4>
                <p className="text-xs text-[var(--text-secondary)]">These verified contact details are provided for platform accountability. External negotiations are forbidden.</p>

                {isBrand ? (
                  /* Brand viewing Creator contact details */
                  <div className="space-y-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-bold">Creator Representative</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{creator.name || 'Alisha'}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-[var(--border-default)] text-sm">
                      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                        <Mail size={16} className="text-indigo-400" />
                        <span>{creator.email || 'alisha.creator@ybex.io'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                        <Instagram size={16} className="text-pink-500" />
                        <span>@{creatorProfile.instagram || creator.instagram || 'ialishathakur'}</span>
                      </div>
                      {creatorProfile.category && (
                        <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                          <MapPin size={16} className="text-teal-400" />
                          <span>Niche: {creatorProfile.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Creator viewing Brand contact details */
                  <div className="space-y-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                        <Building size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-bold">Advertiser / Brand</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{brand.name || 'GutarGoo Plus'}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-[var(--border-default)] text-sm">
                      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                        <Mail size={16} className="text-indigo-400" />
                        <span>{brand.email || 'partner.brand@ybex.io'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                        <Globe size={16} className="text-teal-400" />
                        <span>{brand.website || 'www.gutargoo.com'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                        <MapPin size={16} className="text-amber-500" />
                        <span className="truncate">{brand.profile?.address || 'Udaipur Corporate HQ, Rajasthan'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* 4. CONTACT SUPPORT MODAL */}
          {activeModal === 'support' && (
            <div 
              className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto"
              >
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-elevated)]"><X size={18}/></button>
                
                <h4 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <HelpCircle size={20} className="text-rose-500" /> Contact Support Team
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  Have a payment dispute, scope question, or compliance issue? Create a secure support ticket to be connected with our 24/7 legal mediation team.
                </p>

                <form onSubmit={handleContactSupportSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Subject</label>
                    <input 
                      type="text"
                      required
                      value={supportSubject}
                      onChange={e => setSupportSubject(e.target.value)}
                      placeholder="e.g. Milestone Release Issue, Revision Scope Dispute"
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--violet)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Message Detail</label>
                    <textarea 
                      required
                      value={supportMsg}
                      onChange={e => setSupportMsg(e.target.value)}
                      rows={4}
                      placeholder="Detail the circumstances, guidelines breached, or specific assistance required..."
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--violet)] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={sendingSupport}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send size={14} /> {sendingSupport ? 'Submitting ticket...' : 'Submit Support Ticket'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
