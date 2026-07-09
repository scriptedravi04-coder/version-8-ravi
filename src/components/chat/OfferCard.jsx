import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";
import { toast } from "sonner";

export default function OfferCard({ message, threadId, campaignTitle, onActionComplete, isMine, isUserBrand }) {
  const offer = message.metadata || {};
  const isPending = offer.status === 'PENDING';

  const handleAction = async (action) => {
    try {
      await api.post(`/chat/v2/threads/${threadId}/offer/${offer.id}/${action}`);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} offer`);
    }
  };

  const justifyClass = isMine ? "justify-end" : "justify-start";
  const roundedCorners = isMine ? "rounded-3xl rounded-br-sm" : "rounded-3xl rounded-bl-sm";
  
  const bubbleBg = isMine
    ? (isUserBrand ? "bg-[var(--violet)] text-white" : "bg-[#D9F111] text-black")
    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]";

  const dividerClass = isMine
    ? (isUserBrand ? "border-white/20" : "border-black/10")
    : "border-[var(--border-default)]";

  const timeTextClass = "opacity-60 text-xs";
  
  const buttonClassMine = isUserBrand 
    ? "bg-white text-[var(--violet)] font-bold py-2.5 rounded-xl transition-all w-full text-sm mt-3"
    : "bg-black text-[#D9F111] font-bold py-2.5 rounded-xl transition-all w-full text-sm mt-3";

  const buttonClassOtherAccept = "flex-1 bg-[#D9F111] hover:bg-[#b8cc0e] text-black text-sm font-bold py-2.5 rounded-xl transition-colors";
  const buttonClassOtherReject = "px-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm font-bold py-2.5 rounded-xl transition-colors";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`my-3 flex ${justifyClass}`}
    >
      <div className={`max-w-[75%] sm:max-w-sm w-full p-5 shadow-lg ${bubbleBg} ${roundedCorners}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${dividerClass}`}>
          <span className="font-bold text-sm">
            {isMine ? "Offer from you" : (isUserBrand ? "Creator's Offer" : "Brand's Offer")}
          </span>
          <span className={timeTextClass}>
            {new Date(message.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
          </span>
        </div>

        {/* Amount */}
        <div className="text-3xl font-display font-bold mt-4 mb-2">
          ₹{offer.amount?.toLocaleString('en-IN') || "0"}
        </div>

        {/* Details: Campaign, Deadline, Revisions, Deliverables */}
        <div className={`mt-3 space-y-2 text-sm ${isMine ? (isUserBrand ? 'text-white/90' : 'text-black/80') : 'text-[var(--text-secondary)]'}`}>
          <div className="flex justify-between items-center gap-4">
            <span className="shrink-0">Campaign</span>
            <span className="font-semibold text-right truncate">{campaignTitle || "Campaign"}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="shrink-0">Deadline</span>
            <span className="font-semibold text-right">{offer.deadline ? new Date(offer.deadline).toDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="shrink-0">Revisions</span>
            <span className="font-semibold text-right">{offer.revision_count} included</span>
          </div>
          
          {offer.deliverables && offer.deliverables.length > 0 && (
            <div className={`pt-3 mt-3 border-t ${dividerClass}`}>
              <span className="block mb-2 font-medium">Deliverables:</span>
              <ul className="space-y-1.5 pl-1 text-sm">
                {offer.deliverables.map((item, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="mt-0.5 opacity-60">•</span> 
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isPending ? (
          isMine ? (
             <button disabled className={buttonClassMine}>
               Waiting...
             </button>
          ) : (
            <div className="flex gap-3 mt-5">
              <button 
                onClick={() => handleAction('accept')}
                className={buttonClassOtherAccept}
              >
                Accept
              </button>
              <button 
                onClick={() => handleAction('reject')}
                className={buttonClassOtherReject}
              >
                Reject
              </button>
            </div>
          )
        ) : (
           <button disabled className={`mt-5 w-full py-2.5 font-bold text-sm rounded-xl ${isMine ? (isUserBrand ? 'bg-white/20 text-white' : 'bg-black/10 text-black') : 'bg-[var(--bg-elevated)] border border-[var(--border-default)]'}`}>
             {offer.status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}
           </button>
        )}
      </div>
    </motion.div>
  );
}
