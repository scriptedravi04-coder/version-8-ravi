import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function FeeBreakup({ grossAmount, onDetailsCalculated }) {
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming we calculate it client-side based on config,
    // or call an endpoint. For now, fetch config or display static.
    // The prompt has a `/api/admin/fee-config` which we can read.
    const fetchConfig = async () => {
      try {
        const { data: config } = await api.get('/admin/fee-config');
        const rate = grossAmount <= config.threshold_amount ? config.below_threshold_rate : config.above_threshold_rate;
        const platformFee = (grossAmount * rate) / 100;
        const gst = platformFee * 0.18;
        const creatorNet = grossAmount - platformFee;
        
        const details = {
          grossAmount,
          feePercent: rate,
          platformFee: Math.round(platformFee),
          gstAmount: Math.round(gst),
          creatorNet: Math.round(creatorNet)
        };
        setFeeDetails(details);
        if (onDetailsCalculated) onDetailsCalculated(details);
      } catch (err) {
        // Fallback
        const details = {
          grossAmount,
          feePercent: grossAmount <= 20000 ? 5 : 2,
          platformFee: Math.round(grossAmount * 0.05),
          gstAmount: Math.round(grossAmount * 0.05 * 0.18),
          creatorNet: Math.round(grossAmount * 0.95)
        };
        setFeeDetails(details);
        if (onDetailsCalculated) onDetailsCalculated(details);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [grossAmount]);

  if (loading || !feeDetails) return <div className="animate-pulse h-32 bg-[var(--bg-elevated)] rounded-xl"></div>;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-5 text-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[var(--text-secondary)]">Campaign Amount</span>
        <span className="font-bold text-[var(--text-primary)]">₹{feeDetails.grossAmount.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[var(--text-secondary)]">Platform Fee ({feeDetails.feePercent}%)</span>
        <span className="text-rose-400 font-medium">-₹{feeDetails.platformFee.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-default)]">
        <span className="text-[var(--text-secondary)]">GST on fee (18%)</span>
        <span className="text-amber-400 font-medium">+₹{feeDetails.gstAmount.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-bold text-[var(--text-primary)]">Creator Receives</span>
        <span className="font-display text-[#7C3AED] font-bold text-lg tracking-tight">₹{feeDetails.creatorNet.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
