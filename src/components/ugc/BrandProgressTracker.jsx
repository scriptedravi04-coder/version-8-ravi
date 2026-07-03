import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { key: 'MATCHING_CREATOR', label: 'Posted', icon: '📋' },
  { key: 'CREATOR_BRIEFED',  label: 'Creator Found', icon: '🎯' },
  { key: 'CONTENT_CREATION', label: 'Creating', icon: '🎬' },
  { key: 'QUALITY_REVIEW',   label: 'In Review', icon: '🔍' },
  { key: 'DELIVERED',        label: 'Ready!', icon: '✅' },
];

const STATUS_ORDER = [
  'MATCHING_CREATOR','CREATOR_BRIEFED',
  'CONTENT_CREATION','QUALITY_REVIEW','DELIVERED'
];

const BrandProgressTracker = ({ brandStatus, qualityReviewEndsAt }) => {
  const currentIndex = STATUS_ORDER.indexOf(brandStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative px-2">
        {/* Progress line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-[var(--border-default)] z-0 rounded-full" />
        <motion.div
          className="absolute top-5 left-8 h-1 bg-[#7c3aed] z-0 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(0, currentIndex / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 'calc(100% - 4rem)' }}
        />

        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          
          return (
            <div key={step.key} className="flex flex-col items-center z-10 w-16">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.5 }}
                className={`w-10 h-10 mb-2 rounded-full flex items-center justify-center text-lg border-2 ${
                  isDone    ? 'bg-[#7c3aed] border-[#7c3aed]' :
                  isCurrent ? 'bg-[var(--bg-elevated)] border-[#a78bfa]' :
                              'bg-[var(--bg-elevated)] border-[var(--border-default)]'
                }`}
              >
                {isDone ? '✅' : step.icon}
              </motion.div>
              <span className={`text-[10px] text-center uppercase tracking-wider font-bold ${
                isCurrent ? 'text-[#a78bfa]' :
                isDone    ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <div className="mt-6 text-center bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-default)]">
        {brandStatus === 'MATCHING_CREATOR' && (
          <p className="text-[#facc15] text-sm animate-pulse font-medium">
            🔍 Finding the best creator for your brief...
          </p>
        )}
        {brandStatus === 'CREATOR_BRIEFED' && (
          <p className="text-blue-400 text-sm font-medium">
            🎯 Creator found! They've received your brief and are getting started.
          </p>
        )}
        {brandStatus === 'CONTENT_CREATION' && (
          <p className="text-[#a78bfa] text-sm font-medium">
            🎬 Creator is filming your video. Hang tight!
          </p>
        )}
        {brandStatus === 'QUALITY_REVIEW' && (
          <div>
            <p className="text-orange-400 text-sm font-medium">
              🔍 Under Quality Review — our team is checking your video.
            </p>
            {qualityReviewEndsAt && (
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Usually completes within 2 hours
              </p>
            )}
          </div>
        )}
        {brandStatus === 'DELIVERED' && (
          <p className="text-emerald-400 text-sm font-bold">
            ✅ Your video is ready! Review and approve below.
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandProgressTracker;
