import React from "react";
import { motion } from "framer-motion";

export default function SystemMessage({ message }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-center my-6"
    >
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] px-5 py-2.5 rounded-full shadow-md text-xs text-[var(--text-secondary)] font-medium text-center max-w-[80%]">
        {message.content}
      </div>
    </motion.div>
  );
}
