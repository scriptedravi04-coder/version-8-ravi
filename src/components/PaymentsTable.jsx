import React from "react";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function PaymentsTable({ transactions = [], onRelease }) {
  // Setup nice fallback transaction details if none exist
  const fallbackTxns = [
    { campaign: "Summer Glow Series", creator: "Ravi Kumar", amount: "₹12,000", status: "PAID", date: "Jun 5, 2026", transaction_id: "tx-1" },
    { campaign: "Tech Gadget Review", creator: "@priya", amount: "₹18,000", status: "PENDING", date: "Jun 12, 2026", transaction_id: "tx-2" },
    { campaign: "Fitness App Launch", creator: "@deepak", amount: "₹7,000", status: "PAID", date: "May 20, 2026", transaction_id: "tx-3" }
  ];

  const list = transactions.length > 0 ? transactions : fallbackTxns;

  const getStatusBadge = (status, tx) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PAID":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={11} /> Paid
          </span>
        );
      case "PENDING":
      case "ESCROW_HELD":
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              <Clock size={11} className="animate-spin" /> Pending
            </span>
            {onRelease && (
              <button
                onClick={() => onRelease(tx)}
                className="mt-1 text-[10px] font-bold text-[#9D7CFF] hover:text-[#7C5CFF] hover:underline"
              >
                Release Payment
              </button>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--bg-card)]/80 border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[#1b1935]/30">
              <th className="p-4 px-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Campaign</th>
              <th className="p-4 px-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Creator</th>
              <th className="p-4 px-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Amount</th>
              <th className="p-4 px-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="p-4 px-6 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {list.map((tx, idx) => (
              <tr key={tx.transaction_id || idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 px-6 text-sm font-bold text-[var(--text-primary)]">
                  {tx.campaign || tx.title || "Custom Brief Collab"}
                </td>
                <td className="p-4 px-6 text-sm font-sans font-semibold text-[var(--text-primary)]/80">
                  {tx.creator || tx.creator_name || "Creator Pro"}
                </td>
                <td className="p-4 px-6 text-sm font-mono font-bold text-emerald-400">
                  {typeof tx.amount === "number" ? `₹${tx.amount.toLocaleString("en-IN")}` : tx.amount}
                </td>
                <td className="p-4 px-6">
                  {getStatusBadge(tx.status, tx)}
                </td>
                <td className="p-4 px-6 text-xs text-[var(--text-tertiary)] font-mono">
                  {tx.date || (tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN") : "Recent")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
