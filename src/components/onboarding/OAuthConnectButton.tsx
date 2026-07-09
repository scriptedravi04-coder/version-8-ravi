import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  platform: 'Instagram' | 'YouTube';
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}

export default function OAuthConnectButton({ platform, icon, onClick, loading }: Props) {
  const gradientClass = platform === 'Instagram' 
    ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]'
    : 'bg-[#ff0000]';

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full ${gradientClass} text-white font-bold py-4 px-4 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition"></div>
      {loading ? <Loader2 className="animate-spin relative z-10" size={24} /> : <span className="relative z-10">{icon}</span>}
      <span className="relative z-10 text-lg">Connect {platform}</span>
    </button>
  );
}
