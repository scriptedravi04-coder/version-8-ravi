import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import confetti from "canvas-confetti";

export default function CompletionScreen({
  user,
  onComplete,
}: {
  user: any;
  onComplete: () => void;
}) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3B82F6", "#9ece6a", "#e0af68"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3B82F6", "#9ece6a", "#f7768e"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleFinish = async () => {
    try {
      await supabase
        .from("creator_profiles")
        .update({
          onboarding_complete: true,
          onboarding_completed_at: new Date().toISOString(),
          profile_status: "under_review",
        })
        .eq("user_id", user.user_id);

      await supabase.from("notifications").insert({
        user_id: user.user_id,
        type: "system",
        title: "Profile Submitted!",
        message:
          "Your creator profile is under review. We will notify you once approved.",
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }

    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-12 w-full px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <div className="w-24 h-24 bg-[#9ece6a]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-[#9ece6a]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          You're Live on YBEX! 🎉
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-8">
          Your profile is currently under review. Meanwhile, feel free to
          explore live campaigns!
        </p>

        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-4 rounded-2xl flex items-center justify-center gap-3 max-w-sm mx-auto mb-10 text-sm text-[var(--text-primary)]">
          <Shield className="text-[#3B82F6]" size={20} />
          <span>
            All payments secured in escrow until deliverables are approved
          </span>
        </div>

        <button
          onClick={handleFinish}
          className="bg-[#3B82F6] text-white font-bold py-4 px-10 rounded-2xl hover:bg-[#6b91e5] transition flex items-center justify-center gap-2 mx-auto text-lg"
        >
          Go to Dashboard <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
