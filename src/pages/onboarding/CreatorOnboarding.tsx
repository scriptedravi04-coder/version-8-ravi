import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { saveCreatorProfileStep } from '../../api/onboarding';

import LivePreviewCard from '../../components/onboarding/LivePreviewCard';
import PreStep_EmailVerify from '../../components/onboarding/PreStep_EmailVerify';
import Step1_Identity from '../../components/onboarding/Step1_Identity';
import Step2_Demographics from '../../components/onboarding/Step2_Demographics';
import Step3_SocialChannels from '../../components/onboarding/Step3_SocialChannels';
import Step4_RateCard from '../../components/onboarding/Step4_RateCard';
import CompletionScreen from '../../components/onboarding/CompletionScreen';
import { Zap } from 'lucide-react';

export default function CreatorOnboarding({ user, onComplete }: { user: any, onComplete: () => void }) {
  const { step, setStep, ...state } = useOnboardingStore();

  useEffect(() => {
    if (user?.email_verified) {
      if (step === 0) setStep(1);
    }
  }, [user, step, setStep]);

  useEffect(() => {
    if (step > 1 && step < 5) {
      const dataToSave = {
        full_name: state.fullName,
        date_of_birth: `${state.dobYear}-${state.dobMonth}-${state.dobDay}`,
        profile_photo_url: state.photoUrl,
        bio: state.bio,
        primary_niche: state.primaryNiche,
        gender: state.gender,
        city: state.city,
        state: state.state,
        pincode: state.pinCode,
        languages: state.languages,
        instagram_handle: state.instagramHandle,
        follower_count: state.followerCount,
        average_reach: state.instagramAvgReach,
        instagram_verified: state.instagramVerified,
        instagram_connected_via: state.instagramConnectedVia,
        youtube_channel_url: state.youtubeChannelUrl,
        youtube_subscribers: state.youtubeSubscribers,
        youtube_avg_views: state.youtubeAvgViews,
        youtube_connected: state.youtubeConnected,
        youtube_connected_via: state.youtubeConnectedVia,
        other_platforms: state.otherPlatforms,
        reel_rate: state.reelRate,
        story_rate: state.storyRate,
        youtube_video_rate: state.youtubeVideoRate,
        barter_mode: state.barterMode,
      };
      saveCreatorProfileStep(user.id, dataToSave);
    }
  }, [step]);

  const handleSubmit = async () => {
    setStep(5);
  };

  const handleDevBypass = () => {
    saveCreatorProfileStep(user.id, {
      full_name: "Developer Bypass",
      profile_status: "under_review",
      onboarding_complete: true
    });
    setStep(5);
  };


  if (step === 5) {
    return <CompletionScreen user={user} onComplete={onComplete} />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#1a1b26] text-[#c0caf5]">
      {/* Dev Bypass */}
      {process.env.NODE_ENV !== 'production' && (
        <button 
          onClick={handleDevBypass}
          className="fixed bottom-4 left-4 z-50 bg-[#e0af68] text-[#1a1b26] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-lg hover:bg-[#ffc777]"
        >
          <Zap size={14} /> Skip to Dashboard (Dev Mode)
        </button>
      )}

      {/* Left Panel: Live Preview */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#24283b]/50 border-r border-[#565f89]/20 p-8 flex-col items-center justify-center relative overflow-hidden order-2 lg:order-1">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#7aa2f7]/5 via-[#1a1b26]/0 to-[#1a1b26]/0 pointer-events-none"></div>
        <div className="w-full max-w-sm relative z-10">
          <LivePreviewCard />
        </div>
      </div>

      {/* Right Panel: Form Wizard */}
      <div className="lg:col-span-5 flex flex-col p-6 pt-24 sm:p-12 sm:pt-28 md:p-16 md:pt-32 lg:p-24 lg:pt-32 overflow-y-auto order-1 lg:order-2">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          {/* Progress Bar */}
          {step > 0 && step < 5 && (
            <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= i ? 'bg-[#7aa2f7] text-[#1a1b26]' : 'bg-[#24283b] text-[#565f89] border border-[#565f89]/30'}`}>
                  {i}
                </div>
                {i < 4 && (
                  <div className={`flex-1 h-1 rounded-full transition-all ${step > i ? 'bg-[#7aa2f7]' : 'bg-[#24283b] border border-[#565f89]/30'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && <PreStep_EmailVerify user={user} />}
              {step === 1 && <Step1_Identity user={user} />}
              {step === 2 && <Step2_Demographics user={user} />}
              {step === 3 && <Step3_SocialChannels user={user} />}
              {step === 4 && <Step4_RateCard user={user} onSubmit={handleSubmit} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile Live Preview Toggle or Stack */}
      <div className="w-full sm:hidden p-6 bg-[#24283b] border-t border-[#565f89]/30 order-3">
         <h3 className="text-center text-[#565f89] font-bold text-xs uppercase mb-4 tracking-widest">Live Profile Preview</h3>
         <LivePreviewCard />
      </div>
    </div>
  );
}
