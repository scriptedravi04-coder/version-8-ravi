import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from "lucide-react";

const CreatorCountdown = ({ internalDeadline }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(internalDeadline).getTime() - Date.now();

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
      setIsUrgent(diff < 3 * 60 * 60 * 1000); // < 3 hours
    }, 1000);

    return () => clearInterval(interval);
  }, [internalDeadline]);

  if (isExpired) return (
    <div className="w-full text-rose-600 font-black text-center py-4 bg-rose-500/10 border-y border-rose-500/20 animate-pulse flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]">
      <AlertTriangle size={20} />
      Action Required: Deadline Exceeded!
    </div>
  );

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`flex gap-3 justify-center py-5 bg-[var(--bg-card)] shadow-inner rounded-xl border border-[var(--border-default)] ${isUrgent ? 'text-rose-500 ring-2 ring-rose-500/50 animate-pulse' : 'text-emerald-500'}`}
    >
      {[
        { val: timeLeft.h, label: 'HRS' },
        { val: timeLeft.m, label: 'MIN' },
        { val: timeLeft.s, label: 'SEC' }
      ].map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center min-w-[3.5rem]">
          <span className="font-mono text-4xl font-bold tracking-tight">
            {String(val).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-[var(--text-secondary)] mt-1 uppercase font-black tracking-widest">{label}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default CreatorCountdown;

