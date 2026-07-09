import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function InvoiceModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative max-w-sm w-full mx-auto"
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* The Ticket */}
        <div className="bg-[#F8F9FA] rounded-[32px] overflow-hidden shadow-2xl text-center relative pointer-events-auto filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Cutouts for the ticket style */}
            <div className="absolute top-[200px] left-[-16px] w-8 h-8 bg-black/60 rounded-full"></div>
            <div className="absolute top-[200px] right-[-16px] w-8 h-8 bg-black/60 rounded-full"></div>

            <div className="p-10 pb-6">
                <div className="text-[50px] mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[#111827] mb-2 font-display tracking-tight">Thank you</h2>
                <p className="text-[#4B5563] text-sm leading-relaxed max-w-[220px] mx-auto">
                    Your payment has been processed successfully.
                </p>
            </div>

            <div className="relative px-10">
                <div className="w-full border-t-[2px] border-dashed border-[#D1D5DB]"></div>
            </div>

            <div className="p-10 pt-8 text-left">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Receipt ID</p>
                        <p className="text-[#111827] font-bold text-sm">{transaction.id?.toString().toUpperCase().replace('TXN_', '')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Date</p>
                        <p className="text-[#111827] font-bold text-sm">
                            {new Date(transaction.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="mb-6 space-y-3 border-y border-[#E5E7EB] py-4">
                     <div>
                       <p className="text-[#111827] text-sm font-bold truncate">{transaction.campaign_title || 'Content Collaboration'}</p>
                       <p className="text-xs text-[#6B7280]">Deliverable Payment</p>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-[#6B7280]">Gross Amount</span>
                       <span className="text-[#111827] font-black">₹{transaction.amount?.toLocaleString('en-IN') || 0}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-[#EF4444]">Platform Fee (10%)</span>
                       <span className="text-[#111827] font-black">- ₹{(transaction.fee_amount || (transaction.amount * 0.1))?.toLocaleString('en-IN') || 0}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm pt-2 border-t border-[#E5E7EB] mt-2">
                       <span className="text-[#6B7280] font-bold uppercase text-[10px] tracking-wider">Net Earned</span>
                       <span className="text-[#10B981] font-black text-lg">₹{(transaction.net_amount || (transaction.amount * 0.9))?.toLocaleString('en-IN') || 0}</span>
                     </div>
                </div>

                <div className="bg-[#EEF1F6] rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#111827] rounded-full flex items-center justify-center text-[var(--text-primary)] shrink-0">
                            <span className="text-xs font-bold font-display">YB</span>
                        </div>
                        <div>
                            <p className="text-[#111827] text-sm font-bold">Payout Transferred</p>
                            <p className="text-[#6B7280] text-xs">Direct to Bank Acct.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 mb-4 border-t border-[#E5E7EB] pt-4">
                    <p className="text-center text-[#9CA3AF] text-xs font-medium">Powered by Ybex Payments</p>
                </div>
            </div>

            {/* Bottom scallops */}
            <div className="absolute bottom-[-10px] left-0 right-0 h-5 flex justify-evenly overflow-hidden px-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-black/60 rounded-full mt-2"></div>
                ))}
            </div>
            
        </div>
      </motion.div>
    </div>
  );
}
