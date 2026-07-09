import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ScanningAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => {
        setStep(4);
        setTimeout(onComplete, 500);
      }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center gap-2 text-[#3B82F6] mb-3">
        <Loader2 size={14} className="animate-spin" />
        <span>SCANNING PROFILE METRICS...</span>
      </div>
      <div className="space-y-2 text-[var(--text-primary)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          className="flex gap-2"
        >
          {step >= 1 ? (
            <CheckCircle2 size={14} className="text-[#9ece6a]" />
          ) : (
            <span className="w-3.5" />
          )}
          Handle verified
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 2 ? 1 : 0 }}
          className="flex gap-2"
        >
          {step >= 2 ? (
            <CheckCircle2 size={14} className="text-[#9ece6a]" />
          ) : (
            <span className="w-3.5" />
          )}
          Fetching follower count...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 3 ? 1 : 0 }}
          className="flex gap-2"
        >
          {step >= 3 ? (
            <CheckCircle2 size={14} className="text-[#9ece6a]" />
          ) : (
            <span className="w-3.5" />
          )}
          Calculating average reach...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 4 ? 1 : 0 }}
          className="flex gap-2 text-[#9ece6a] font-bold mt-2"
        >
          {step >= 4 ? <CheckCircle2 size={14} /> : <span className="w-3.5" />}
          Profile scan complete!
        </motion.div>
      </div>
    </div>
  );
}
