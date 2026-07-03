import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, Wallet, CheckCircle, Clock, Building2, ChevronRight, ChevronLeft, Plus, Edit2, ShieldCheck, X, ShieldAlert, Sparkles, Loader2, FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import AddPaymentMethod from "../components/AddPaymentMethod";
import PaymentMethodCard from "../components/PaymentMethodCard";
import KycVerificationModal from "../components/KycVerificationModal";
import InvoiceModal from "../components/InvoiceModal";

// --- HELPER COMPONENT: COUNT UP ---
function CountUp({ value, prefix = "", suffix = "" }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => 
    prefix + Math.round(current).toLocaleString("en-IN") + suffix
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

// --- MOCK DATA ---
const MOCK_EARNINGS = [
  { id: 6, amount: 18000, month: "June", year: 2026, status: "pending", campaign_title: "Gaming Setup Tour", brand_name: "Logitech", created_at: "2026-06-05T13:00:00Z" },
  { id: 5, amount: 9000, month: "May", year: 2026, status: "pending", campaign_title: "Summer Wardrobe Haul", brand_name: "Myntra", created_at: "2026-05-18T11:20:00Z" },
  { id: 4, amount: 15000, month: "April", year: 2026, status: "paid", campaign_title: "Eco-friendly Skincare", brand_name: "Plum", created_at: "2026-04-10T16:45:00Z" },
  { id: 3, amount: 8500, month: "March", year: 2026, status: "paid", campaign_title: "Fitness App Reel", brand_name: "Strava", created_at: "2026-03-20T09:15:00Z" },
  { id: 2, amount: 12000, month: "February", year: 2026, status: "paid", campaign_title: "Urban Tech Review", brand_name: "Samsung", created_at: "2026-02-12T14:30:00Z" },
  { id: 1, amount: 6000, month: "January", year: 2026, status: "paid", campaign_title: "Nike Spring Collection", brand_name: "Nike", created_at: "2026-01-15T10:00:00Z" },
];

const MOCK_CHART_DATA = [
  { month: "Jan", amount: 6000 },
  { month: "Feb", amount: 12000 },
  { month: "Mar", amount: 8500 },
  { month: "Apr", amount: 15000 },
  { month: "May", amount: 9000 },
  { month: "Jun", amount: 18000 },
];

export default function Earnings() {
  const { user } = useAuth();
  
  // States
  const [bankDetails, setBankDetails] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [kycObj, setKycObj] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchPaymentMethods();
    fetchTransactions();
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const { data } = await api.get("/verifications/me");
      setKycObj(data);
    } catch (err) {
      console.warn("Could not retrieve KYC in earnings:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTxns(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get('/creator/payment-methods');
      setPaymentMethods(data || []);
      // Maintain backward compatibility for conditional rendering
      if (data && data.length > 0) {
        setBankDetails(true); 
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    }
  };
  
  // Calculate Totals using live data
  const txDataSource = transactions;
  
  const totalEarned = txDataSource.filter(e => e.status === 'paid' || e.status === 'SUCCESS').reduce((sum, e) => sum + (e.net_amount || e.amount || 0), 0);
  const thisMonth = txDataSource.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).reduce((sum, e) => sum + (e.net_amount || e.amount || 0), 0);
  const pendingPayout = txDataSource.filter(e => e.status === 'pending' || e.status === 'PENDING').reduce((sum, e) => sum + (e.net_amount || e.amount || 0), 0);
  const completedCollabs = txDataSource.filter(e => e.status === 'paid' || e.status === 'SUCCESS').length;

  const chartData = useMemo(() => {
    const data = [
      { month: "Jan", amount: 0 },
      { month: "Feb", amount: 0 },
      { month: "Mar", amount: 0 },
      { month: "Apr", amount: 0 },
      { month: "May", amount: 0 },
      { month: "Jun", amount: 0 },
      { month: "Jul", amount: 0 },
      { month: "Aug", amount: 0 },
      { month: "Sep", amount: 0 },
      { month: "Oct", amount: 0 },
      { month: "Nov", amount: 0 },
      { month: "Dec", amount: 0 },
    ];
    txDataSource.forEach(tx => {
      if (tx.status === 'paid' || tx.status === 'SUCCESS') {
        const date = new Date(tx.created_at);
        const monthIndex = date.getMonth();
        data[monthIndex].amount += (tx.net_amount || tx.amount || 0);
      }
    });
    // Return last 6 months
    const currentMonth = new Date().getMonth();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m < 0) m += 12;
      result.push(data[m]);
    }
    return result;
  }, [txDataSource]);
  const totalPages = Math.ceil(txDataSource.length / itemsPerPage);
  const currentItems = txDataSource.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleBankSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const accNumber = formData.get('account_number');
    const confirmAcc = formData.get('confirm_account_number');
    
    if (accNumber !== confirmAcc) {
      toast.error("Account numbers do not match.");
      return;
    }
    
    setBankDetails({
      account_holder: formData.get('account_holder'),
      account_number: accNumber,
      ifsc: formData.get('ifsc').toUpperCase(),
      bank_name: formData.get('bank_name'),
      upi_id: formData.get('upi_id'),
    });
    
    toast.success("Bank details saved successfully!");
    setShowBankModal(false);
  };

  const handleWithdrawal = () => {
    setWithdrawalRequested(true);
    toast.success("Payout request submitted! We'll transfer within 3-5 business days.");
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-white mb-2 tracking-tight">Earnings &amp; Payouts</h1>
          <p className="text-white/50 text-sm">Track your balance, view history, and manage bank information.</p>
        </div>
        
        {/* WITHDRAWAL REQUEST ACTION */}
        {(pendingPayout > 0 && bankDetails) && (
          <button 
            onClick={handleWithdrawal}
            disabled={withdrawalRequested}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${withdrawalRequested ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {withdrawalRequested ? (
               <>Payout Requested ✓</>
            ) : (
               <>
                 <Wallet size={18} /> Request Payout (₹{pendingPayout.toLocaleString('en-IN')})
               </>
            )}
          </button>
        )}
      </div>

      {/* KYC WARNING / STATUS BANNER */}
      {user?.role === "creator" && (
        <div className="mb-8">
          {(!kycObj || kycObj.status !== "approved") ? (
            kycObj?.status === "pending" ? (
              <div id="kyc-banner-pending" className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 sm:p-6 text-[#FBBF24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30 mt-0.5 sm:mt-0 shrink-0">
                    <Loader2 size={18} className="animate-spin" />
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-sm">KYC Documents Under Review</h4>
                    <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
                      Our automated manual compliance operators are checking your tax cards, linked UPI destinations, and social proof attachments. Your clearance resolves within 24 hours. Transactions can continue as scheduled.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowKycModal(true)} 
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            ) : kycObj?.status === "rejected" ? (
              <div id="kyc-banner-rejected" className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 sm:p-6 text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 mt-0.5 sm:mt-0 shrink-0">
                    <ShieldAlert size={18} />
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-sm">KYC Compliance Check Rejected</h4>
                    <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
                      Correction needed: <span className="text-rose-400 font-semibold">"{kycObj.review_note || "Invalid or blurry ID files."}"</span>. Please resubmit valid details to lift withdrawal constraints immediately.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowKycModal(true)} 
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-900/30 whitespace-nowrap"
                >
                  Fix & Resubmit
                </button>
              </div>
            ) : (
              <div id="kyc-banner-unverified" className="bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 rounded-3xl p-6 text-[#9D7CFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-32 w-32 bg-[#7C5CFF]/5 rounded-full filter blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <span className="p-3 bg-[#7C5CFF]/20 text-[#a285ff] rounded-2xl border border-[#7C5CFF]/30 shrink-0">
                    <ShieldAlert size={20} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#a285ff] bg-[#7C5CFF]/10 px-2.5 py-0.5 rounded border border-[#7C5CFF]/20">Action Mandatory</span>
                      <span className="text-white/30 text-[10px] flex items-center gap-1"><Sparkles size={11} /> 2 mins verification</span>
                    </div>
                    <h4 className="text-white font-sans font-bold text-base">Complete KYC Verification Now</h4>
                    <p className="text-xs text-white/55 mt-1 max-w-2xl leading-relaxed">
                      In compliance with local financial acts and money laundering checks, you must submit automated KYC registration. Unverified accounts cannot initiate direct transfers. Start secure verifications to obtain your Checked badge.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowKycModal(true)} 
                  className="px-6 py-3 bg-[#7C5CFF] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#7C5CFF]/20 shrink-0 whitespace-nowrap w-full sm:w-auto text-center"
                >
                  Complete KYC Verification
                </button>
              </div>
            )
          ) : (
            <div id="kyc-banner-complete" className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-4 text-emerald-400 flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">Compliance verification approved! Checked badge and instant payouts active. Balance withdrawal unlocked.</p>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1A24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all hover:bg-[#1A1A24]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Total Earned</div>
          </div>
          <div className="text-3xl font-display font-bold text-white tracking-tight">
             <CountUp value={totalEarned} prefix="₹" />
          </div>
        </div>

        <div className="bg-[#1A1A24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all hover:bg-[#1A1A24]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">This Month</div>
          </div>
          <div className="text-3xl font-display font-bold text-white tracking-tight">
             <CountUp value={thisMonth} prefix="₹" />
          </div>
        </div>

        <div className="bg-[#1A1A24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all hover:bg-[#1A1A24]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Pending Payout</div>
          </div>
          <div className="text-3xl font-display font-bold text-white tracking-tight">
             <CountUp value={pendingPayout} prefix="₹" />
          </div>
        </div>

        <div className="bg-[#1A1A24]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all hover:bg-[#1A1A24]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Completed Collabs</div>
          </div>
          <div className="text-3xl font-display font-bold text-white tracking-tight">
             <CountUp value={completedCollabs} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        
        {/* TRANSACTIONS CHART (LEFT) */}
        <div className="xl:col-span-2 bg-[#1A1A24]/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Earnings Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{fill: '#9CA3AF', fontSize: 13}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#9CA3AF', fontSize: 13}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(124, 58, 237, 0.1)'}}
                  contentStyle={{ backgroundColor: '#1A1A24', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#7C3AED" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INVOICES SECTION (RIGHT) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="bg-[#1A1A24]/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="text-[#10B981]" size={20} />
                Recent Invoices
              </h2>
            </div>

            <div className="flex-grow flex flex-col space-y-4">
               {transactions.length > 0 && transactions.filter(t => t.status==='paid' || t.status==='SUCCESS').slice(0,3).map(t => (
                 <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                   <div>
                     <p className="text-sm font-bold text-white truncate max-w-[150px]">{t.campaign_title || 'Collab Payment'}</p>
                     <p className="text-xs text-gray-500">{(t.net_amount||t.amount).toLocaleString('en-IN')} INR</p>
                   </div>
                   <button onClick={() => setSelectedInvoice(t)} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20">
                     <FileText size={14} />
                   </button>
                 </div>
               ))}
               
               {(!transactions.length || transactions.filter(t => t.status==='paid' || t.status==='SUCCESS').length === 0) && (
                 <div className="text-center py-6 my-auto text-gray-500 text-sm">
                   <p>No paid invoices found.</p>
                 </div>
               )}
            </div>
            
            <button onClick={() => toast("Full invoice history coming soon")} className="mt-4 w-full border border-white/10 text-white/70 hover:text-white py-3 rounded-xl font-bold text-sm bg-white/5">
               View All Invoices
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedInvoice && <InvoiceModal transaction={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      </AnimatePresence>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-[#1A1A24]/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>
        
        {txDataSource.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <DollarSign className="text-white/20" size={32} />
             </div>
             <h3 className="text-white font-medium mb-2">No earnings yet</h3>
             <p className="text-sm text-white/50 mb-6">Complete campaigns and collaborations to earn money.</p>
             <button className="text-[#7C3AED] font-bold text-sm bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 px-6 py-2.5 rounded-xl transition-colors">
               Explore Campaigns
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono whitespace-nowrap">Campaign Name</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono whitespace-nowrap">Amount (₹)</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono whitespace-nowrap">Platform Fee</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono whitespace-nowrap">Status</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono text-right whitespace-nowrap">Date</th>
                  <th className="p-4 pr-6 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((item) => {
                  const grossAmount = item.amount || item.gross_amount || 0;
                  const feeAmount = item.fee_amount || 0;
                  const netAmount = item.net_amount || grossAmount;
                  const title = item.campaign_title || (item.deals && item.deals.campaigns ? item.deals.campaigns.title : 'Campaign Payment');
                  const statusLabel = (item.status === 'paid' || item.status === 'SUCCESS') ? 'PAID' : (item.status ? item.status.toUpperCase() : 'PENDING');
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white whitespace-nowrap">{title}</td>
                      <td className="p-4 font-display font-semibold text-white whitespace-nowrap">₹{netAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-rose-400 font-mono text-sm whitespace-nowrap">- ₹{feeAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                           statusLabel === 'PAID' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 
                           'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                         }`}>
                           {statusLabel}
                         </span>
                      </td>
                      <td className="p-4 text-right text-white/50 text-sm whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        {statusLabel === 'PAID' && (
                          <button 
                            onClick={() => setSelectedInvoice(item)} 
                            className="text-xs text-[#7C3AED] hover:text-white bg-[#7C3AED]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#7C3AED]/30 flex items-center gap-1.5 ml-auto"
                          >
                            <FileText size={12} /> Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
           <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
             <div>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, txDataSource.length)} of {txDataSource.length} entries</div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
               >
                 <ChevronLeft size={16} />
               </button>
               <div className="px-3 font-semibold text-white">Page {currentPage} of {totalPages}</div>
               <button 
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages}
                 className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
               >
                 <ChevronRight size={16} />
               </button>
             </div>
           </div>
        )}
      </div>

      {/* BANK DETAILS MODAL */}
      {showBankModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBankModal(false)}></div>
          <div className="bg-[#1A1A24] border border-white/10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="text-[#7C3AED]" size={22} />
                Bank Information
              </h2>
              <button type="button" onClick={() => setShowBankModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="bank-form" onSubmit={handleBankSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Account Holder Name</label>
                  <input required name="account_holder" defaultValue={bankDetails?.account_holder} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-medium" placeholder="As per bank records" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Account Number</label>
                  <input required name="account_number" defaultValue={bankDetails?.account_number} type="password" placeholder="Enter Account Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-mono tracking-wider" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Confirm Account Number</label>
                  <input required name="confirm_account_number" defaultValue={bankDetails?.account_number} type="text" placeholder="Re-enter Account Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-mono tracking-wider" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input required name="ifsc" defaultValue={bankDetails?.ifsc} type="text" placeholder="e.g. HDFC0001234" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-mono uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Bank Name</label>
                    <input required name="bank_name" defaultValue={bankDetails?.bank_name} type="text" placeholder="e.g. HDFC Bank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-medium" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex justify-between">
                    <span>UPI ID</span>
                    <span className="text-white/30">(Optional)</span>
                  </label>
                  <input name="upi_id" defaultValue={bankDetails?.upi_id} type="text" pattern="^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$" placeholder="yourname@bank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-all font-medium" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 shrink-0 bg-white/[0.02]">
               <button form="bank-form" type="submit" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-2">
                 <ShieldCheck size={18} /> Save Securely
               </button>
            </div>
          </div>
        </div>
      )}

      <KycVerificationModal 
        isOpen={showKycModal} 
        onClose={() => setShowKycModal(false)} 
        onComplete={fetchKycStatus} 
      />

    </div>
  );
}
