import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { sendOTP, verifyOTP } from "../../api/onboarding";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export default function PreStep_EmailVerify({ user }: { user: any }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [shake, setShake] = useState(false);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { setStep } = useOnboardingStore();

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOTP = async () => {
    setLoading(true);
    const success = await sendOTP(user?.email);
    setLoading(false);
    if (success) {
      setOtpSent(true);
      setCooldown(60);
      toast.success("OTP sent! (Dev Mode Mock Code: 123456)");
    } else {
      toast.error("Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    const success = await verifyOTP(user?.email, code);

    if (success) {
      await supabase
        .from("users")
        .update({ email_verified: true })
        .eq("id", user.user_id);
      await supabase
        .from("verifications")
        .insert({
          user_id: user.user_id,
          type: "email",
          status: "verified",
          verified_at: new Date().toISOString(),
        });
      setStep(1);
      toast.success("Email verified successfully!");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Incorrect OTP, try again");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const maskedEmail = user?.email?.replace(
    /(.{2})(.*)(?=@)/,
    (gp1: string, gp2: string, gp3: string) => {
      return gp1 + gp3.replace(/./g, "*");
    },
  );

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Verify Your Email
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 mt-2">
          We need to verify{" "}
          <span className="font-medium text-[var(--text-primary)]">{maskedEmail}</span>{" "}
          before you continue.
        </p>

        {!otpSent ? (
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-[#3B82F6] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#6b91e5] transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Send OTP
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-12 h-14 bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] text-center text-xl font-bold rounded-xl focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-[#3B82F6] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#6b91e5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Verify Email
            </button>

            <div className="text-left text-sm mt-4">
              <button
                onClick={handleSendOTP}
                disabled={cooldown > 0 || loading}
                className="text-[var(--text-secondary)] hover:text-[#3B82F6] transition disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
