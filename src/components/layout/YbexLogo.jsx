import React, { useState } from "react";

export default function YbexLogo({ className = "" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img 
        src="/logo.png" 
        alt="Ybex Logo" 
        className={`object-contain ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`inline-flex items-center font-sans font-black tracking-tighter select-none text-3xl sm:text-4xl ${className}`}>
      <span className="text-[var(--text-primary)]">YB</span>
      <span className="text-[var(--violet)]">E</span>
      <span className="text-[var(--text-primary)]">X</span>
    </div>
  );
}

