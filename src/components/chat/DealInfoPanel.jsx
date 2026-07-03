import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock } from 'lucide-react';

export default function DealInfoPanel({ thread, onClose, role }) {
  if (!thread) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--bg-card)] border-l border-[var(--border-default)] z-20 flex flex-col"
      >
        <div className="p-5 flex justify-between items-center border-b border-[var(--border-default)]">
          <h3 className="font-bold text-[var(--text-primary)]">Deal Information</h3>
          <button onClick={onClose} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-elevated)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
             <div className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-bold mb-2">Agreed Amount</div>
             <div className={`text-4xl font-display font-bold ${role === 'brand' ? 'text-[var(--violet)]' : 'text-[#D9F111]'}`}>
               ₹{thread.agreed_amount?.toLocaleString() || 0}
             </div>
             <div className="mt-3 inline-block px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-xs font-bold text-[var(--text-secondary)]">
               Status: {thread.status}
             </div>
          </div>

          <div>
             <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Timeline</h4>
             <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-strong)] before:to-transparent">
                {['NEGOTIATING', 'ACTIVE', 'CONTENT_SUBMITTED', 'APPROVED', 'COMPLETED'].map((step, idx) => {
                  const isActive = thread.status === step;
                  const steps = ['NEGOTIATING', 'ACTIVE', 'CONTENT_SUBMITTED', 'APPROVED', 'COMPLETED'];
                  const isPast = steps.indexOf(thread.status) > idx;

                  return (
                    <div key={step} className="relative flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${isPast || isActive ? (role === 'brand' ? 'bg-[var(--violet)] border-[var(--violet)]' : 'bg-[#D9F111] border-[#D9F111]') : 'bg-[var(--bg-elevated)] border-[var(--border-default)]'} z-10 shrink-0 shadow max-md:ml-[2px]`}>
                         {(isPast || isActive) && <CheckCircle size={12} className={role === 'brand' ? 'text-[var(--text-primary)]' : 'text-black'} />}
                      </div>
                      <div className={`text-xs font-bold ${isActive ? 'text-[var(--text-primary)]' : (isPast ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]')}`}>
                        {step.replace('_', ' ')}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-default)]">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[var(--text-secondary)] text-sm">Deadline</span>
               <span className="text-[var(--text-primary)] font-medium">{thread.deadline ? new Date(thread.deadline).toLocaleDateString() : 'TBD'}</span>
             </div>
             <div className="flex justify-between items-center mb-3">
               <span className="text-[var(--text-secondary)] text-sm">Revisions Left</span>
               <span className="text-[var(--text-primary)] font-medium">{thread.revision_count ?? 'N/A'}</span>
             </div>
             <div className="pt-3 border-t border-[var(--border-default)]">
               <span className="text-[var(--text-secondary)] text-sm block mb-2">Deliverables</span>
               <ul className="space-y-2">
                 {thread.deliverables?.map((d, i) => (
                   <li key={i} className="text-xs text-[var(--text-primary)]/80 flex items-start gap-2">
                     <CheckCircle size={14} className={role === 'brand' ? 'text-[var(--violet)]' : 'text-[#D9F111]'} />
                     <span>{d}</span>
                   </li>
                 )) || <li className="text-xs text-[var(--text-tertiary)]">No deliverables</li>}
               </ul>
             </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
