import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, Sparkles, Save, Plus, Trash2, CheckCircle, Flame, ShieldCheck, HelpCircle, AlertCircle, TrendingUp, Info, DollarSign, Calendar, Layers } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function InlineNegotiation({ thread, role, onNegotiationComplete }) {
  const isBrand = role === 'brand';
  const [loading, setLoading] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [pastOffers, setPastOffers] = useState([]);
  
  // Local editable state for proposing new rates
  const [items, setItems] = useState([
    { id: '1', name: 'Instagram Reel Post', qty: 1, rate: 10000 },
    { id: '2', name: 'Instagram Story with Link', qty: 2, rate: 2500 }
  ]);
  const [revisions, setRevisions] = useState(3);
  const [deadlineDays, setDeadlineDays] = useState(7);

  // Load existing breakdown or seed from thread deliverables
  useEffect(() => {
    if (thread) {
      loadOffers();
      
      if (thread.breakdown && Array.isArray(thread.breakdown) && thread.breakdown.length > 0) {
        setItems(thread.breakdown.map((item, idx) => ({
          id: item.id || String(idx),
          name: item.name || item.item || 'Deliverable',
          qty: item.qty || 1,
          rate: item.rate || 0
        })));
      } else if (thread.deliverables && thread.deliverables.length > 0) {
        // Seed from deliverables
        const seeded = thread.deliverables.map((del, idx) => {
          let defaultRate = 5000;
          if (del.toLowerCase().includes('youtube')) defaultRate = 15000;
          if (del.toLowerCase().includes('reel')) defaultRate = 10000;
          if (del.toLowerCase().includes('story')) defaultRate = 2500;
          return {
            id: String(idx),
            name: del,
            qty: 1,
            rate: defaultRate
          };
        });
        setItems(seeded);
      }
      
      if (thread.revision_count) {
        setRevisions(thread.revision_count);
      }
    }
  }, [thread]);

  const loadOffers = async () => {
    try {
      const { data } = await api.get(`/chat/v2/threads/${thread.id}/messages`);
      if (data) {
        // Find all offers
        const offers = data.filter(m => m.message_type === 'offer' && m.metadata);
        setPastOffers(offers);

        const pendingOffers = offers.filter(o => o.metadata.status === 'PENDING');
        if (pendingOffers.length > 0) {
          const latestOffer = pendingOffers[pendingOffers.length - 1].metadata;
          setActiveOffer(latestOffer);
          
          if (latestOffer.breakdown && Array.isArray(latestOffer.breakdown)) {
            setItems(latestOffer.breakdown);
          }
        } else {
          setActiveOffer(null);
        }
      }
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0);
  const platformFeePct = 2; // 2% platform fee
  const platformFee = Math.round(subtotal * (platformFeePct / 100));
  const creatorDeduction = Math.round(subtotal * 0.02); // 2% creator safety deduction
  const brandTotal = subtotal + platformFee;
  const creatorTotal = subtotal - creatorDeduction;

  const handleAddRow = () => {
    setItems([...items, {
      id: String(Date.now()),
      name: 'Custom Deliverable Asset',
      qty: 1,
      rate: 3000
    }]);
  };

  const handleRemoveRow = (id) => {
    if (items.length <= 1) {
      toast.error("You must negotiate with at least one deliverable item.");
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'name' ? value : Math.max(0, parseInt(value) || 0)
        };
      }
      return item;
    }));
  };

  const handleQtyAdjust = (id, amount) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          qty: Math.max(1, item.qty + amount)
        };
      }
      return item;
    }));
  };

  const handlePropose = async () => {
    if (subtotal <= 0) {
      toast.error("Proposal value must be greater than zero.");
      return;
    }

    // Crucial: enforce the minimum campaign budget threshold of ₹3,000 as explicitly instructed by the user
    if (subtotal < 3000) {
      toast.error("Budget Violation: Proposal amount cannot be lower than ₹3,000 baseline threshold.", {
        description: "To safeguard safety standards, all platform sponsorships require a minimum execution rate of ₹3,000."
      });
      return;
    }

    setLoading(true);
    try {
      const deliverablesList = items.map(i => `${i.qty}x ${i.name}`);
      const calculatedDeadline = new Date();
      calculatedDeadline.setDate(calculatedDeadline.getDate() + deadlineDays);

      await api.post(`/chat/v2/threads/${thread.id}/offer`, {
        amount: subtotal,
        deliverables: deliverablesList,
        deadline: calculatedDeadline.toISOString(),
        revision_count: revisions,
        breakdown: items
      });

      toast.success("Negotiation offer sent to partner! 🚀", {
        description: `Your proposed contract value of ₹${subtotal.toLocaleString('en-IN')} has been broadcast.`
      });
      
      if (onNegotiationComplete) onNegotiationComplete();
      loadOffers();
    } catch (err) {
      toast.error("Failed to submit counter offer: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    const idToAccept = offerId || (activeOffer && activeOffer.id);
    if (!idToAccept) return;
    setLoading(true);
    try {
      await api.post(`/chat/v2/threads/${thread.id}/offer/${idToAccept}/accept`);
      toast.success("Deal locked & fixed! Main communication channel is now active. 🤝💸");
      if (onNegotiationComplete) onNegotiationComplete();
    } catch (err) {
      toast.error("Failed to accept proposal: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    const idToReject = offerId || (activeOffer && activeOffer.id);
    if (!idToReject) return;
    setLoading(true);
    try {
      await api.post(`/chat/v2/threads/${thread.id}/offer/${idToReject}/reject`);
      toast.success("Proposal declined. You can propose alternative rates below.");
      setActiveOffer(null);
      if (onNegotiationComplete) onNegotiationComplete();
      loadOffers();
    } catch (err) {
      toast.error("Failed to decline proposal: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-8 p-6 lg:p-8 h-full overflow-y-auto no-scrollbar bg-[var(--bg-base)]">
      
      {/* Left side: Interactive negotiation form and calculator */}
      <div className="flex-1 space-y-8 bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-default)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-3xl transition-all duration-300">
        
        {/* Modern Bento Title Block */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-[var(--violet)] to-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-[var(--text-primary)] leading-tight tracking-tight">
              Live Sponsorship Negotiation
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
              Construct your customized line-by-line deliverables below. Adjust rates, quantities, and timelines in real-time to match campaign objectives.
            </p>
          </div>
        </div>

        {/* Campaign Minimum Banner */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start gap-3">
          <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-100 uppercase tracking-wider">Campaign Valuation Baseline Protection</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              To guarantee execution quality and platform safety, negotiations are bounded by a minimum deal volume of <strong className="text-amber-400">₹3,000</strong>. Subtotals below ₹3,000 cannot be submitted.
            </p>
          </div>
        </div>

        {/* Deliverables editable grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-[var(--text-tertiary)]" /> Campaign Deliverable Checklist
            </span>
            <button 
              onClick={handleAddRow}
              className="text-xs text-[var(--violet)] hover:text-indigo-400 font-bold flex items-center gap-1.5 transition-all bg-[var(--bg-elevated)]/40 hover:bg-[var(--border-strong)] px-3 py-1.5 rounded-xl border border-[var(--border-default)]"
            >
              <Plus size={14} /> Add Deliverable
            </button>
          </div>

          <div className="bg-[var(--bg-elevated)]/20 border border-[var(--border-default)] rounded-3xl overflow-hidden shadow-sm">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/40 text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              <div className="col-span-6 sm:col-span-7">Asset & Creative Medium</div>
              <div className="col-span-3 sm:col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Unit Rate (₹)</div>
            </div>

            <div className="divide-y divide-[var(--border-default)]">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 px-6 py-5 items-center hover:bg-[var(--bg-elevated)]/10 transition-all duration-150">
                  
                  {/* Asset name */}
                  <div className="col-span-12 sm:col-span-7 flex items-center gap-3">
                    <button 
                      onClick={() => handleRemoveRow(item.id)}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all shrink-0"
                      title="Remove deliverable"
                    >
                      <Trash2 size={15} />
                    </button>
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] font-semibold focus:ring-0 focus:outline-none p-0 focus:text-[var(--violet)]"
                      placeholder="e.g. Dedicated Instagram Post"
                    />
                  </div>

                  {/* Quantity adjust buttons */}
                  <div className="col-span-6 sm:col-span-2 flex items-center justify-center gap-1.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-1 max-w-[100px] mx-auto">
                    <button 
                      type="button"
                      onClick={() => handleQtyAdjust(item.id, -1)}
                      className="w-6 h-6 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono w-5 text-center">
                      {item.qty}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleQtyAdjust(item.id, 1)}
                      className="w-6 h-6 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white flex items-center justify-center text-xs font-bold transition-all"
                    >
                      +
                    </button>
                  </div>

                  {/* Rate field */}
                  <div className="col-span-6 sm:col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] font-bold">₹</span>
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl pl-6 pr-3 py-2 text-right text-xs focus:ring-1 focus:ring-[var(--violet)] focus:outline-none font-mono text-[var(--text-primary)] font-black"
                      min="0"
                      step="500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revisions & Deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest flex items-center gap-1.5">
              <RefreshCw size={12} /> Revisions Included
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={revisions}
                onChange={e => setRevisions(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[var(--bg-elevated)]/40 border border-[var(--border-default)] rounded-2xl px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--violet)] transition-all font-mono"
                min="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] font-bold uppercase">Cycles</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest flex items-center gap-1.5">
              <Calendar size={12} /> Work Timeline Limit
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={deadlineDays}
                onChange={e => setDeadlineDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[var(--bg-elevated)]/40 border border-[var(--border-default)] rounded-2xl px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--violet)] transition-all font-mono"
                min="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] font-bold uppercase">Days</span>
            </div>
          </div>
        </div>

        {/* Ledger Calculator */}
        <div className="bg-[var(--bg-elevated)]/30 border border-[var(--border-default)] rounded-3xl p-6 space-y-4 shadow-inner">
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest block">
            Realtime Valuation Ledger & Gateway Breakdown
          </span>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-[var(--text-secondary)] font-medium">
              <span>Subtotal Deliverables Gross Cost:</span>
              <span className="font-mono text-white text-base font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {isBrand ? (
              <>
                <div className="flex justify-between items-center text-[var(--text-secondary)] font-medium">
                  <span>Platform Gateway Protection Fee (2%):</span>
                  <span className="font-mono text-indigo-400 font-bold">+₹{platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-[var(--border-default)] flex justify-between items-center">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Total Brand Escrow Vault Bond:</span>
                  <span className="font-mono text-xl font-black text-[var(--violet)]">
                    ₹{brandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center text-[var(--text-secondary)] font-medium">
                  <span>Escrow Guarantee Protection Charge (2%):</span>
                  <span className="font-mono text-rose-400 font-bold">-₹{creatorDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-[var(--border-default)] flex justify-between items-center">
                  <span className="text-sm font-bold text-[var(--text-primary)]">Guaranteed Net Creator Payout:</span>
                  <span className="font-mono text-xl font-black text-[#D9F111]">
                    ₹{creatorTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button 
            onClick={handlePropose}
            disabled={loading || subtotal < 3000}
            className={`px-8 py-4 rounded-2xl font-black text-xs font-mono tracking-wider uppercase shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${isBrand ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-[#D9F111] text-slate-950 hover:bg-yellow-400'}`}
          >
            <Save size={16} /> {loading ? 'SUBMITTING...' : 'PROPOSE TERMS TO PARTNER'}
          </button>
        </div>
      </div>

      {/* Right side: Shared counter offer status log */}
      <div className="w-full xl:w-96 flex flex-col space-y-6">
        <span className="text-xs text-[var(--text-tertiary)] uppercase font-extrabold tracking-widest block px-1">
          Negotiation Log & Status Trail
        </span>

        {activeOffer ? (
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/[0.02] border-2 border-amber-500/20 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shadow-inner">
                <Flame size={18} className="animate-pulse" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-amber-200 uppercase tracking-widest">Awaiting Action</h4>
                <span className="text-[10px] text-amber-500/80 font-mono font-bold uppercase">PENDING OFFER &bull; ₹{activeOffer.amount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {activeOffer.offered_by === thread.creator_id 
                ? `Creator proposed an itemized valuation of ₹${activeOffer.amount.toLocaleString('en-IN')}. Confirm to bind contracts, or send a counter-rate.`
                : `Brand offered a campaign deal value of ₹${activeOffer.amount.toLocaleString('en-IN')}. Confirm to unlock main messenger chat channel.`}
            </p>

            <div className="bg-black/40 p-4 rounded-2xl space-y-2 border border-amber-500/10">
              {activeOffer.deliverables?.map((del, idx) => (
                <div key={idx} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="text-amber-500 font-mono font-extrabold text-xs">✓</span> {del}
                </div>
              ))}
            </div>

            {/* Accept / Decline actions */}
            {activeOffer.offered_by !== (isBrand ? thread.brand_id : thread.creator_id) ? (
              <div className="flex gap-3 pt-1">
                <button 
                  onClick={() => handleAcceptOffer(activeOffer.id)}
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <Check size={16} /> Accept & Lock
                </button>
                <button 
                  onClick={() => handleRejectOffer(activeOffer.id)}
                  disabled={loading}
                  className="px-4 py-3 bg-rose-500/15 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-amber-400 text-center font-mono animate-pulse">
                ⏳ Waiting for partner response to your proposal...
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--bg-elevated)]/20 border border-[var(--border-default)] rounded-[2rem] p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[var(--bg-elevated)]/60 text-[var(--text-tertiary)] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle size={24} />
            </div>
            <h5 className="text-sm font-bold text-[var(--text-primary)]">No Active Proposals</h5>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
              There is currently no pending offer in arbitration. Propose customized terms using the left table to begin!
            </p>
          </div>
        )}

        {/* Past proposals audit list */}
        <div className="flex-1 bg-[var(--bg-elevated)]/10 border border-[var(--border-default)] rounded-[2rem] p-6 overflow-y-auto max-h-[340px] space-y-4 no-scrollbar">
          <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest block px-1">Past Proposals History</span>
          
          <div className="space-y-2.5">
            {pastOffers.map((offer, idx) => {
              const meta = offer.metadata;
              const isMine = meta.offered_by === (isBrand ? thread.brand_id : thread.creator_id);
              return (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-default)] p-4 rounded-2xl flex items-center justify-between text-xs hover:border-[var(--border-strong)] transition-all">
                  <div className="space-y-1">
                    <div className="font-extrabold text-[var(--text-primary)] text-sm">₹{meta.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      By {isMine ? 'You' : 'Partner'} &bull; {new Date(offer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase ${meta.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : meta.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {meta.status}
                  </span>
                </div>
              );
            })}
          </div>
          {pastOffers.length === 0 && (
            <div className="text-xs text-[var(--text-tertiary)] text-center italic py-8">
              No historical counter proposals recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
