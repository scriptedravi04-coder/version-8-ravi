import React, { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function InlineAgreement({ thread, role, onSigned }) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const isBrand = role === 'brand';
  const partnerName = isBrand ? (thread?.creator?.name || "the creator") : (thread?.brand?.name || "the brand");

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post(`/chat/v2/threads/${thread.id}/accept-terms`);
      toast.success("Terms and Conditions accepted!");
      if (onSigned) onSigned();
    } catch (error) {
      console.error('Error signing:', error);
      toast.error(error.response?.data?.error || "Failed to accept terms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-center gap-3 bg-[var(--bg-elevated)] shrink-0">
        <Shield size={20} className="text-[var(--violet)]" />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Terms and Conditions
        </h3>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--bg-base)]">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Before you begin chatting...</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Please accept our standard platform terms to start collaborating with {partnerName}.
            </p>
          </div>

          <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-default)] space-y-4 text-sm text-[var(--text-secondary)]">
            <p>
              By proceeding with this conversation, you agree to the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All communications must remain respectful and professional.</li>
              <li>Transactions and payments must be processed through the platform to ensure security and escrow protection.</li>
              <li>Do not share sensitive personal information or financial details in the chat.</li>
              <li>The platform reserves the right to review chat history in case of a dispute.</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 p-4 bg-[var(--bg-elevated)]/50 rounded-xl border border-[var(--border-strong)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-[var(--violet)] rounded border-[var(--border-strong)] focus:ring-[var(--violet)]"
            />
            <span className="text-sm text-[var(--text-primary)]">
              I have read and agree to the platform Terms and Conditions and Community Guidelines.
            </span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[var(--border-default)] bg-[var(--bg-card)] flex justify-end shrink-0">
        <button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className="px-6 py-2.5 bg-[var(--violet)] hover:bg-fuchsia-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="animate-pulse">Accepting...</span>
          ) : (
            <>
              <CheckCircle size={16} /> Accept & Start Chatting
            </>
          )}
        </button>
      </div>
    </div>
  );
}
