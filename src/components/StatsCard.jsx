import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

function CountUp({ value, prefix = "", suffix = "" }) {
  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  const display = useTransform(spring, (current) => 
    prefix + Math.round(current).toLocaleString("en-IN") + suffix
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function StatsCard({ label, value, prefix = "", suffix = "", icon: Icon, colorClass = "text-[#9D7CFF]" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg-card)]/90 border border-[var(--border-default)] rounded-xl p-5 shadow-sm text-left relative overflow-hidden transition-all hover:border-[#7C5CFF]/30 hover:shadow-[0_8px_30px_rgba(124,92,255,0.05)]"
    >
      <div className="absolute right-3 bottom-0 text-[var(--text-primary)]/[0.02] pointer-events-none">
        {Icon && <Icon size={80} />}
      </div>
      <div className="text-[11px] uppercase font-semibold text-[var(--text-secondary)] tracking-wider">
        {label}
      </div>
      <div className={`text-3xl font-black font-display mt-2 ${colorClass}`}>
        <CountUp value={Number(value) || 0} prefix={prefix} suffix={suffix} />
      </div>
    </motion.div>
  );
}
