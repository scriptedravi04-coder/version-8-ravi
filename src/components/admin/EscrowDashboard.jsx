import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownRight, ArrowUpRight, TrendingUp, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function EscrowDashboard() {
  const [tab, setTab] = useState('Overview'); // Overview, Transactions, Withdrawals
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/admin/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5">
             <div className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2"><CreditCard size={16}/> Total Funds in Escrow</div>
             <div className="font-display text-4xl font-bold">₹245K</div>
             <div className="text-xs text-green-400 mt-2 flex items-center gap-1">+12% vs last month</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5">
             <div className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2"><TrendingUp size={16}/> Platform Fees Collected</div>
             <div className="font-display text-4xl font-bold text-[#9D7CFF]">₹42.5K</div>
             <div className="text-xs text-green-400 mt-2 flex items-center gap-1">+5.2% vs last month</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5">
             <div className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2"><FileText size={16}/> GST Reported</div>
             <div className="font-display text-4xl font-bold">₹7.6K</div>
             <div className="text-xs text-[var(--text-tertiary)] mt-2 flex items-center gap-1">Liability this month</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5">
             <div className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2"><ArrowUpRight size={16}/> Processed Payouts</div>
             <div className="font-display text-4xl font-bold">₹184K</div>
             <div className="text-xs text-[var(--text-tertiary)] mt-2 flex items-center gap-1">To creators (YTD)</div>
          </div>
       </div>

       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
             <h3 className="font-semibold text-lg flex items-center gap-2">Global Ledger & Transactions</h3>
             <div className="flex gap-2">
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"/>
                   <input type="text" placeholder="Search TxID or account..." className="pl-9 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-sm focus:border-[#9D7CFF] focus:outline-none"/>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-sm font-semibold hover:bg-foreground/5 transition-colors">
                   <Calendar size={16}/> Filter Range
                </button>
             </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-default)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Tx ID / Type</th>
                <th className="px-4 py-3 font-medium">From / To</th>
                <th className="px-4 py-3 font-medium text-right">Gross Amount</th>
                <th className="px-4 py-3 font-medium text-right">Fee + GST</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-foreground/5 pb-4">
               {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-foreground/5 transition-colors">
                     <td className="px-4 py-4">
                        <div className="font-mono text-xs text-[var(--text-secondary)]">{tx.id}</div>
                        <div className="font-semibold mt-0.5 flex items-center gap-1.5">
                           {tx.type === 'Wallet Top-up' && <ArrowDownRight size={14} className="text-blue-400"/>}
                           {tx.type === 'Refund' && <ArrowDownRight size={14} className="text-amber-400"/>}
                           {tx.type === 'Escrow Release' && <ArrowUpRight size={14} className="text-green-400"/>}
                           {tx.type === 'Escrow Lock' && <CreditCard size={14} className="text-[var(--text-primary)]/60"/>}
                           {tx.type}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{tx.date}</div>
                     </td>
                     <td className="px-4 py-4">
                        <div className="text-[var(--text-primary)]/80"><span className="text-[var(--text-tertiary)] text-xs inline-block w-8">From:</span> {tx.from}</div>
                        <div className="text-[var(--text-primary)]/80 mt-1"><span className="text-[var(--text-tertiary)] text-xs inline-block w-8">To:</span> {tx.to}</div>
                     </td>
                     <td className="px-4 py-4 text-right">
                        <div className="font-mono font-medium">₹{tx.amount.toLocaleString()}</div>
                     </td>
                     <td className="px-4 py-4 text-right">
                        <div className="text-xs text-[#9D7CFF]">Fee: ₹{tx.fee.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-secondary)]">GST: ₹{tx.gst.toLocaleString()}</div>
                     </td>
                     <td className="px-4 py-4 text-right flex justify-end">
                        <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                           <CheckCircle2 size={12}/> {tx.status}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  )
}
