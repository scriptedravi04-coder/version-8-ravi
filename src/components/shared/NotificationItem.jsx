import React from "react";

const NOTI_ICONS = {
  KYC_APPROVED: '✅',
  KYC_REJECTED: '❌',
  CAMPAIGN_LIVE: '🚀',
  CAMPAIGN_REJECTED: '❌',
  NEW_APPLICATION: '📩',
  SHORTLISTED: '⭐',
  CHAT_UNLOCKED: '💬',
  OFFER_RECEIVED: '💰',
  DEAL_SIGNED: '🤝',
  CONTENT_SUBMITTED: '🎬',
  CONTENT_APPROVED: '✅',
  REVISION_REQUESTED: '✏️',
  PROOF_SUBMITTED: '📊',
  PAYMENT_RECEIVED: '💸',
  PAYMENT_PENDING: '⏳',
  PAYMENT_METHOD_APPROVED: '🏦',
  PAYMENT_METHOD_REJECTED: '🚫',
  WARNING_ISSUED: '⚠️',
  ACCOUNT_RESTRICTED: '🔒',
  campaign_application_approved: '✅',
  campaign_application_declined: '❌',
  collab_action: '🤝',
  wave: '👋',
  collab_request: '💼'
};

function formatTimeAgo(dateString) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const ms = now.getTime() - past.getTime();
    if (isNaN(ms)) return "just now";
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    
    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return "recently";
  }
}

export default function NotificationItem({ notification, onRead }) {
  const icon = NOTI_ICONS[notification.type] || '🔔';
  const timeAgo = formatTimeAgo(notification.created_at);
  const isRead = notification.read;

  return (
    <div
      onClick={() => !isRead && onRead(notification.notif_id)}
      className={`flex items-start gap-3 p-4 border-b border-foreground/5 hover:bg-foreground/5 cursor-pointer transition-colors ${
        !isRead ? 'bg-[#7C5CFF]/5 border-l-2 border-l-[#7C5CFF]' : ''
      }`}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-t-[14px] rounded-bl-[14px] rounded-br-[4px] flex items-center justify-center text-lg shrink-0 ${
        !isRead ? 'bg-[#7C5CFF]/20 text-[#9D7CFF]' : 'bg-foreground/5'
      }`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'}`}>
          {notification.message}
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-1 font-mono">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {!isRead && (
        <div className="w-2 h-2 bg-[#7C5CFF] rounded-full shrink-0 mt-1.5" />
      )}
    </div>
  );
}
