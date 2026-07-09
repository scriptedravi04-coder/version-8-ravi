import { create } from 'zustand';

interface OnboardingState {
  step: number;
  emailVerified: boolean;
  
  // Step 1
  fullName: string;
  username: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  photoUrl: string;
  bio: string;
  primaryNiche: string[];
  gender: string;

  // Step 2
  city: string;
  state: string;
  pinCode: string;
  languages: string[];

  // Step 3
  instagramHandle: string;
  followerCount: number;
  instagramAvgReach: number;
  instagramVerified: boolean;
  instagramConnectedVia: 'oauth' | 'manual' | null;

  youtubeConnected: boolean;
  youtubeChannelUrl: string;
  youtubeSubscribers: number;
  youtubeAvgViews: number;
  youtubeConnectedVia: 'oauth' | 'manual' | null;

  otherPlatforms: {
    twitter: string;
    moj: string;
    sharechat: string;
    linkedin: string;
    snapchat: string;
  };

  // Step 4
  reelRate: number | '';
  storyRate: number | '';
  youtubeVideoRate: number | '';
  barterMode: 'cash_only' | 'barter_friendly' | 'partial_barter';

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (field: keyof OnboardingState, value: any) => void;
  updateOtherPlatform: (platform: keyof OnboardingState['otherPlatforms'], value: string) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0, // 0 is pre-step, 1-4 are form steps, 5 is completion
  emailVerified: false,
  
  fullName: '',
  username: '',
  dobDay: '',
  dobMonth: '',
  dobYear: '',
  photoUrl: '',
  bio: '',
  primaryNiche: [],
  gender: '',

  city: '',
  state: '',
  pinCode: '',
  languages: [],

  instagramHandle: '',
  followerCount: 0,
  instagramAvgReach: 0,
  instagramVerified: false,
  instagramConnectedVia: null,

  youtubeConnected: false,
  youtubeChannelUrl: '',
  youtubeSubscribers: 0,
  youtubeAvgViews: 0,
  youtubeConnectedVia: null,

  otherPlatforms: {
    twitter: '',
    moj: '',
    sharechat: '',
    linkedin: '',
    snapchat: '',
  },

  reelRate: '',
  storyRate: '',
  youtubeVideoRate: '',
  barterMode: 'cash_only',

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  updateField: (field, value) => set({ [field]: value }),
  updateOtherPlatform: (platform, value) => set((state) => ({
    otherPlatforms: { ...state.otherPlatforms, [platform]: value }
  })),
}));
