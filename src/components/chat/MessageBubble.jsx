import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import SystemMessage from "./SystemMessage";
import OfferCard from "./OfferCard";

export default function MessageBubble({ message, isMine, isUserBrand, threadId, campaignTitle, onActionComplete }) {
  const isSystem = message.message_type === 'system' || message.message_type === 'payment_trigger';
  const isOffer = message.message_type === 'offer';

  if (isSystem) {
    return <SystemMessage message={message} />;
  }
  if (isOffer) {
    return <OfferCard message={message} threadId={threadId} campaignTitle={campaignTitle} onActionComplete={onActionComplete} />;
  }

  const isBrandSender = message.sender_role === 'brand';
  const justifyClass = isMine ? "justify-end" : "justify-start";
  const roundedCorners = isMine ? "rounded-3xl rounded-br-sm" : "rounded-3xl rounded-bl-sm";
  
  const bubbleBg = isMine
    ? (isUserBrand ? "bg-[var(--violet)] text-white" : "bg-[#D9F111] text-black font-semibold")
    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]";
     
  const timeTextClass = "text-inherit opacity-60 text-right mt-1";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`flex ${justifyClass} my-3`}
    >
      {!isMine && isUserBrand && (
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] p-1.5 flex items-center justify-center mr-3 flex-shrink-0 mt-auto mb-1 border border-[var(--border-default)]">
           <span className="text-xs font-bold text-[var(--text-secondary)]">C</span>
        </div>
      )}
      {!isMine && !isUserBrand && (
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] p-1.5 flex items-center justify-center mr-3 flex-shrink-0 mt-auto mb-1 border border-[var(--border-default)]">
           <Building2 size={12} className="text-[var(--text-secondary)]"/>
        </div>
      )}
      <div className={`max-w-[75%] px-5 py-3.5 text-sm leading-relaxed shadow-lg ${bubbleBg} ${roundedCorners}`}>
        {message.content}
        <div className={`text-[10px] mt-2 tracking-wider ${timeTextClass}`}>
          {new Date(message.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
        </div>
      </div>
    </motion.div>
  );
}
