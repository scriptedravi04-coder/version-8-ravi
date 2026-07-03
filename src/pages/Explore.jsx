import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatorCard from "../components/CreatorCard";
import { MapPin, SlidersHorizontal, ChevronDown, Check, X, Search, Globe } from "lucide-react";
import { supabase } from "../lib/supabase";

// Helper functions for parsing numerical values
const parseReachNum = (val) => {
  if (!val) return 0;
  const raw = val.toString().trim().toLowerCase().replace(/,/g, '');
  if (/^[\d.]+k$/.test(raw)) return Math.round(parseFloat(raw) * 1000);
  if (/^[\d.]+m$/.test(raw)) return Math.round(parseFloat(raw) * 1000000);
  if (/^[\d.]+l$/.test(raw)) return Math.round(parseFloat(raw) * 100000);
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
};

const parseFollowersCount = (raw) => {
  if (raw === null || raw === undefined) return 0;
  const txt = raw.toString().trim().toLowerCase().replace(/,/g, '');
  if (!txt) return 0;
  if (/^[\d.]+\s*k\+?$/.test(txt)) return Math.round(parseFloat(txt) * 1000);
  if (/^[\d.]+\s*l\+?$/.test(txt)) return Math.round(parseFloat(txt) * 100000);
  if (/^[\d.]+\s*m\+?$/.test(txt)) return Math.round(parseFloat(txt) * 1000000);
  return parseInt(txt.replace(/[^0-9]/g, ''), 10) || 0;
};

// Lists of Options as instructed
const NICHES = [
  {
    group: "Fashion & Beauty",
    items: ["Fashion", "Beauty & Makeup", "Skincare", "Jewellery & Accessories"]
  },
  {
    group: "Health & Lifestyle",
    items: ["Fitness & Gym", "Yoga & Wellness", "Health & Nutrition", "Mental Health"]
  },
  {
    group: "Food & Travel",
    items: ["Food & Cooking", "Travel & Vlogging", "Street Food", "Hotel & Hospitality"]
  },
  {
    group: "Tech & Gaming",
    items: ["Tech & Gadgets", "Mobile Reviews", "Gaming", "AI & Software"]
  },
  {
    group: "Finance & Education",
    items: ["Personal Finance", "Stock Market", "Education & Coaching", "Career & Jobs"]
  },
  {
    group: "Entertainment",
    items: ["Comedy & Memes", "Music & Dance", "Movies & Web Series", "Podcasts"]
  },
  {
    group: "Parenting & Home",
    items: ["Parenting", "Interior Design", "DIY & Craft", "Pets"]
  },
  {
    group: "Sports & Automotive",
    items: ["Sports & Cricket", "Cycling & Running", "Automotive"]
  }
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kochi", 
  "Chandigarh", "Indore", "Bhopal", "Noida", "Gurgaon", "Nagpur", 
  "Patna", "Bhubaneswar"
];

const STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", 
  "Gujarat", "Rajasthan", "Uttar Pradesh", "Kerala", "Punjab", "Madhya Pradesh", 
  "Bihar", "Odisha", "Haryana"
];

const LANGUAGES = ["English", "Hindi", "Punjabi", "Gujarati", "Marathi", "Tamil", "Telugu", "Bengali", "Kannada"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook"];
const GENDERS = ["Any", "Male", "Female", "Other"];

export default function Explore() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search bar
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters state helper
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'niche' | 'location' | 'platform' | 'language' | 'gender' | 'sort' | null

  // Dropdown searches
  const [nicheSearch, setNicheSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationTab, setLocationTab] = useState("cities"); // 'cities' | 'states'
  const [platformSearch, setPlatformSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  // Selection states
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [gender, setGender] = useState("Any");
  
  // Chips and extra filters
  const [selectedFollowerRanges, setSelectedFollowerRanges] = useState([]); // 'nano', 'micro', 'macro', 'mega'
  const [collabMode, setCollabMode] = useState("Both"); // 'Paid' | 'Barter' | 'Both'
  const [selectedContentTypes, setSelectedContentTypes] = useState([]); // 'Reel', 'Post', 'Story', 'YT Video'
  const [sortBy, setSortBy] = useState("reach"); // 'reach' | 'followers' | 'engagement' | 'newest' | 'rate_asc'

  // Debounced filters to prevent lagging query/sorting
  const [appliedFilters, setAppliedFilters] = useState({
    niches: [],
    platforms: [],
    cities: [],
    states: [],
    languages: [],
    gender: "Any",
    followerRanges: [],
    collabMode: "Both",
    contentTypes: []
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Debounce other filters (har filter change pe auto-fetch with 300ms transition)
  useEffect(() => {
    const handler = setTimeout(() => {
      setAppliedFilters({
        niches: selectedNiches,
        platforms: selectedPlatforms,
        cities: selectedCities,
        states: selectedStates,
        languages: selectedLanguages,
        gender,
        followerRanges: selectedFollowerRanges,
        collabMode,
        contentTypes: selectedContentTypes
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [
    selectedNiches,
    selectedPlatforms,
    selectedCities,
    selectedStates,
    selectedLanguages,
    gender,
    selectedFollowerRanges,
    collabMode,
    selectedContentTypes
  ]);

  // Click outside to close panels and dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Dropdowns check
      if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-popover')) {
        setActiveDropdown(null);
      }
      // Drawer panel check
      if (!e.target.closest('.filter-container-block')) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch real data from Supabase - resilient fallback query logic
  const loadAllCreators = async () => {
    setLoading(true);
    let loadedData = null;

    // Attempt 1: Fetch from 'creator_profiles'
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*');
      if (!error && data && data.length > 0) {
        loadedData = data;
      }
    } catch (e) {
      console.log("creator_profiles check failed, falling back to applications:", e);
    }

    // Attempt 2: Fallback to 'applications' table
    if (!loadedData) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*');
        if (!error && data) {
          loadedData = data;
        }
      } catch (e) {
        console.error("applications table fallback failed too:", e);
      }
    }

    setCreators(loadedData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAllCreators();
  }, []);

  // Toglars
  const toggleNiche = (item) => {
    setSelectedNiches(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const togglePlatform = (item) => {
    setSelectedPlatforms(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleCity = (item) => {
    setSelectedCities(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleState = (item) => {
    setSelectedStates(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleLanguage = (item) => {
    setSelectedLanguages(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleFollowerRange = (item) => {
    setSelectedFollowerRanges(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleContentType = (item) => {
    setSelectedContentTypes(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleClearAll = () => {
    setSelectedNiches([]);
    setSelectedPlatforms([]);
    setSelectedCities([]);
    setSelectedStates([]);
    setSelectedLanguages([]);
    setGender("Any");
    setSelectedFollowerRanges([]);
    setCollabMode("Both");
    setSelectedContentTypes([]);
  };

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += selectedNiches.length;
    count += selectedPlatforms.length;
    count += selectedCities.length;
    count += selectedStates.length;
    count += selectedLanguages.length;
    if (gender !== "Any") count += 1;
    count += selectedFollowerRanges.length;
    if (collabMode !== "Both") count += 1;
    count += selectedContentTypes.length;
    return count;
  }, [
    selectedNiches,
    selectedPlatforms,
    selectedCities,
    selectedStates,
    selectedLanguages,
    gender,
    selectedFollowerRanges,
    collabMode,
    selectedContentTypes
  ]);

  // Clientside search and memo filters matching DB logic
  const filteredCreators = useMemo(() => {
    let result = creators;

    // Search profile filters
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase().trim();
      result = result.filter(c => {
        const name = (c.full_name || c.name || "").toLowerCase();
        const handle = (c.instagram_handle || c.handle || "").toLowerCase();
        const city = (c.city || "").toLowerCase();
        const state = (c.state || "").toLowerCase();
        const niche = (c.content_niches || c.category || "").toLowerCase();
        return name.includes(term) || handle.includes(term) || city.includes(term) || state.includes(term) || niche.includes(term);
      });
    }

    // Niches
    if (appliedFilters.niches.length > 0) {
      result = result.filter(c => {
        const niche = (c.content_niches || c.category || "").toLowerCase();
        return appliedFilters.niches.some(selected => niche.includes(selected.toLowerCase()));
      });
    }

    // Platforms
    if (appliedFilters.platforms.length > 0) {
      result = result.filter(c => {
        return appliedFilters.platforms.some(plat => {
          if (plat.toLowerCase() === 'instagram') return c.instagram_handle || c.instagram || c.followers_instagram;
          if (plat.toLowerCase() === 'youtube') return c.youtube_channel || c.youtube || c.followers_youtube;
          return false;
        });
      });
    }

    // Cities
    if (appliedFilters.cities.length > 0) {
      result = result.filter(c => {
        const city = (c.city || "").toLowerCase();
        return appliedFilters.cities.some(selected => city.includes(selected.toLowerCase()));
      });
    }

    // States
    if (appliedFilters.states.length > 0) {
      result = result.filter(c => {
        const state = (c.state || "").toLowerCase();
        return appliedFilters.states.some(selected => state.includes(selected.toLowerCase()));
      });
    }

    // Languages
    if (appliedFilters.languages.length > 0) {
      result = result.filter(c => {
        const languages = (c.languages || []).map(l => l.toLowerCase());
        const langStr = (c.language || "").toLowerCase();
        return appliedFilters.languages.some(selected => {
          const s = selected.toLowerCase();
          return languages.includes(s) || langStr.includes(s);
        });
      });
    }

    // Gender
    if (appliedFilters.gender !== "Any") {
      result = result.filter(c => {
        const g = (c.gender || "").toLowerCase();
        return g === appliedFilters.gender.toLowerCase();
      });
    }

    // Creator Size Ranges
    if (appliedFilters.followerRanges.length > 0) {
      result = result.filter(c => {
        const followers = parseFollowersCount(c.followers_count || c.followers_instagram || c.followers_youtube || 0);
        return appliedFilters.followerRanges.some(range => {
          if (range === 'nano') return followers >= 1000 && followers < 10000;
          if (range === 'micro') return followers >= 10000 && followers < 100000;
          if (range === 'macro') return followers >= 100000 && followers < 1000000;
          if (range === 'mega') return followers >= 1000000;
          return false;
        });
      });
    }

    // Collab Mode
    if (appliedFilters.collabMode !== "Both") {
      result = result.filter(c => {
        const pref = (c.collab_preference || "").toLowerCase();
        const isBarterOnly = c.barter === true || pref.includes("barter");
        if (appliedFilters.collabMode === 'Barter') {
          return isBarterOnly;
        } else {
          return !isBarterOnly || pref.includes("paid");
        }
      });
    }

    // Content types
    if (appliedFilters.contentTypes.length > 0) {
      result = result.filter(c => {
        const searchStr = `${c.deliverables || ''} ${c.content_niches || c.category || ''} ${c.avg_reach_per_reel ? 'Reel' : ''}`.toLowerCase();
        return appliedFilters.contentTypes.some(type => searchStr.includes(type.toLowerCase()));
      });
    }

    // Sorting
    const sorted = [...result];
    if (sortBy === 'reach') {
      sorted.sort((a, b) => parseReachNum(b.avg_reach_per_reel || b.avg_reach || 0) - parseReachNum(a.avg_reach_per_reel || a.avg_reach || 0));
    } else if (sortBy === 'followers') {
      sorted.sort((a, b) => parseFollowersCount(b.followers_count || b.followers_instagram || b.followers_youtube || 0) - parseFollowersCount(a.followers_count || a.followers_instagram || a.followers_youtube || 0));
    } else if (sortBy === 'engagement') {
      sorted.sort((a, b) => parseFloat(b.engagement_rate || 0) - parseFloat(a.engagement_rate || 0));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.submitted_at || b.created_at || 0).getTime() - new Date(a.submitted_at || a.created_at || 0).getTime());
    } else if (sortBy === 'rate_asc') {
      sorted.sort((a, b) => parseFloat(a.base_rate || a.rate || 0) - parseFloat(b.base_rate || b.rate || 0));
    }

    return sorted;
  }, [creators, debouncedSearch, appliedFilters, sortBy]);

  return (
    <div className="w-full max-w-none px-4 md:px-8 py-10" data-testid="explore-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
        <div>
          <div className="font-display text-[34px] font-bold tracking-tight leading-[1.1] mb-[10px] text-[var(--text-primary)]">
            Meet the <span className="text-[#7C5CFF]">Creators</span> 🎬
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">India's most influential voices — handpicked for brand impact.</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D9F111] bg-[#D9F111]/10 border border-[#D9F111]/20 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9F111] animate-pulse"></span>
              Live Network
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-0 flex-wrap mt-[14px] mb-[22px] text-[var(--text-primary)]/80">
        <div className="flex items-center gap-1.5 pr-4">
          <span className="font-display text-lg font-black text-[#7C5CFF]">80+</span>
          <span className="text-xs text-[var(--text-secondary)]">Creators</span>
        </div>
        <div className="w-[1px] h-4 bg-[var(--bg-elevated)] mr-4"></div>
        <div className="flex items-center gap-1.5 pr-4">
          <span className="font-display text-lg font-black text-[var(--text-primary)]">18+</span>
          <span className="text-xs text-[var(--text-secondary)]">Brand Partners</span>
        </div>
        <div className="w-[1px] h-4 bg-[var(--bg-elevated)] mr-4"></div>
        <div className="flex items-center gap-1.5 pr-4">
          <span className="font-display text-lg font-black text-[var(--text-primary)]">5K+</span>
          <span className="text-xs text-[var(--text-secondary)]">Collabs Done</span>
        </div>
        <div className="w-[1px] h-4 bg-[var(--bg-elevated)] mr-4"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--text-secondary)]">📍 Pan-India</span>
        </div>
      </div>
      
      <div className="h-[1px] bg-[var(--bg-elevated)] mb-6"></div>

      {/* FILTER PARENT CONTAINER (z-30 ensures popovers render above everything) */}
      <div className="flex flex-col gap-2 mb-8 filter-container-block relative z-40">
        
        {/* ROW: Search bar + Filter Compact Button (Exact Ek line me) */}
        <div className="flex gap-3 items-center w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
            <input 
              className="w-full pl-11 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] bg-[var(--bg-card)] outline-none focus:border-[var(--violet)]/20 shadow-sm transition-all focus:ring-4 focus:ring-[#7C5CFF]/10 placeholder:text-[var(--text-tertiary)]"
              type="text" 
              placeholder="Search by name, handle, or city..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setFilterOpen(!filterOpen); }}
            className={`px-5 py-3 rounded-xl border text-sm flex items-center gap-2 cursor-pointer transition-all shrink-0 select-none ${
              filterOpen || activeFilterCount > 0 
                ? 'bg-[var(--violet)]/15 border-[#7C5CFF] text-[var(--violet)] font-semibold' 
                : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--violet)] text-white text-[10px] font-black flex items-center justify-center animate-in scale-in duration-200">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic drawer sliding panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-visible mt-2 w-full"
            >
              <div className="p-4 sm:p-5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl space-y-4 shadow-2xl relative">
                
                {/* Row 1 — Dropdowns (horizontal) */}
                <div className="flex flex-wrap gap-2.5">
                  
                  {/* 🎯 Niche Dropdown */}
                  <div className="relative dropdown-trigger">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'niche' ? null : 'niche'); }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all ${
                        selectedNiches.length > 0 
                          ? 'bg-[var(--violet)]/15 border-[var(--violet)]/20 text-[var(--violet)] font-medium' 
                          : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span>🎯 Niche {selectedNiches.length > 0 ? `(${selectedNiches.length})` : ''}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'niche' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'niche' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 mt-2 w-72 max-h-[380px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3 shadow-2xl space-y-3 dropdown-popover"
                        >
                          <input 
                            type="text"
                            placeholder="Filter niches..."
                            value={nicheSearch}
                            onChange={(e) => setNicheSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#7C5CFF]"
                          />
                          <div className="space-y-3 max-h-[230px] overflow-y-auto select-none pr-1">
                            {NICHES.map((group) => {
                              const filteredItems = group.items.filter(item => item.toLowerCase().includes(nicheSearch.toLowerCase()));
                              if (filteredItems.length === 0) return null;
                              return (
                                <div key={group.group} className="space-y-1">
                                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] tracking-wider uppercase px-2 py-0.5">{group.group}</div>
                                  {filteredItems.map(item => {
                                    const isSelected = selectedNiches.includes(item);
                                    return (
                                      <button
                                        key={item}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNiche(item);
                                        }}
                                        className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg text-left transition-colors ${
                                          isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                        }`}
                                      >
                                        <span>{item}</span>
                                        {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 📱 Platform Dropdown */}
                  <div className="relative dropdown-trigger">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'platform' ? null : 'platform'); }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all ${
                        selectedPlatforms.length > 0 
                          ? 'bg-[var(--violet)]/15 border-[var(--violet)]/20 text-[var(--violet)] font-medium' 
                          : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span>📱 Platform {selectedPlatforms.length > 0 ? `(${selectedPlatforms.length})` : ''}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'platform' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'platform' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3 shadow-2xl space-y-2 dropdown-popover"
                        >
                          <input 
                            type="text"
                            placeholder="Filter platform..."
                            value={platformSearch}
                            onChange={(e) => setPlatformSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#7C5CFF]"
                          />
                          <div className="space-y-1 select-none">
                            {PLATFORMS.filter(p => p.toLowerCase().includes(platformSearch.toLowerCase())).map(p => {
                              const isSelected = selectedPlatforms.includes(p);
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlatform(p);
                                  }}
                                  className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg text-left transition-colors ${
                                    isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                  }`}
                                >
                                  <span>{p}</span>
                                  {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 📍 Location Dropdown (Tabs for Cities + States) */}
                  <div className="relative dropdown-trigger">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'location' ? null : 'location'); }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all ${
                        (selectedCities.length > 0 || selectedStates.length > 0)
                          ? 'bg-[var(--violet)]/15 border-[var(--violet)]/20 text-[var(--violet)] font-medium' 
                          : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span>📍 Location {(selectedCities.length + selectedStates.length) > 0 ? `(${selectedCities.length + selectedStates.length})` : ''}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'location' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3 shadow-2xl space-y-3 dropdown-popover"
                        >
                          {/* Tabs */}
                          <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--bg-base)] rounded-xl text-xs">
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setLocationTab('cities'); }}
                              className={`py-1.5 rounded-lg text-center transition-all ${locationTab === 'cities' ? 'bg-[var(--violet)] text-white font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              Cities
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setLocationTab('states'); }}
                              className={`py-1.5 rounded-lg text-center transition-all ${locationTab === 'states' ? 'bg-[var(--violet)] text-white font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                              States
                            </button>
                          </div>

                          {/* Search */}
                          <input 
                            type="text"
                            placeholder={`Search ${locationTab === 'cities' ? 'cities' : 'states'}...`}
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#7C5CFF]"
                          />

                          {/* List */}
                          <div className="max-h-[180px] overflow-y-auto select-none space-y-1 pr-1">
                            {locationTab === 'cities' ? (
                              CITIES.filter(city => city.toLowerCase().includes(locationSearch.toLowerCase())).map(city => {
                                const isSelected = selectedCities.includes(city);
                                return (
                                  <button
                                    key={city}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCity(city);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg text-left transition-colors ${
                                      isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                    }`}
                                  >
                                    <span>{city}</span>
                                    {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                  </button>
                                );
                              })
                            ) : (
                              STATES.filter(state => state.toLowerCase().includes(locationSearch.toLowerCase())).map(state => {
                                const isSelected = selectedStates.includes(state);
                                return (
                                  <button
                                    key={state}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleState(state);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg text-left transition-colors ${
                                      isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                    }`}
                                  >
                                    <span>{state}</span>
                                    {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 🗣️ Language Dropdown */}
                  <div className="relative dropdown-trigger">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'language' ? null : 'language'); }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all ${
                        selectedLanguages.length > 0 
                          ? 'bg-[var(--violet)]/15 border-[var(--violet)]/20 text-[var(--violet)] font-medium' 
                          : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span>🗣️ Language {selectedLanguages.length > 0 ? `(${selectedLanguages.length})` : ''}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'language' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'language' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3 shadow-2xl space-y-2 dropdown-popover"
                        >
                          <input 
                            type="text"
                            placeholder="Filter languages..."
                            value={languageSearch}
                            onChange={(e) => setLanguageSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#7C5CFF]"
                          />
                          <div className="space-y-1 select-none max-h-[160px] overflow-y-auto pr-1">
                            {LANGUAGES.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).map(l => {
                              const isSelected = selectedLanguages.includes(l);
                              return (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLanguage(l);
                                  }}
                                  className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg text-left transition-colors ${
                                    isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                  }`}
                                >
                                  <span>{l}</span>
                                  {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 👤 Gender Dropdown */}
                  <div className="relative dropdown-trigger">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'gender' ? null : 'gender'); }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all ${
                        gender !== 'Any'
                          ? 'bg-[var(--violet)]/15 border-[var(--violet)]/20 text-[var(--violet)] font-medium' 
                          : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span>👤 Gender {gender !== 'Any' ? `: ${gender}` : ''}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'gender' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'gender' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 mt-2 w-44 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-2 shadow-2xl dropdown-popover"
                        >
                          <div className="space-y-0.5 select-none text-xs">
                            {GENDERS.map(g => {
                              const isSelected = gender === g;
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGender(g);
                                    setActiveDropdown(null);
                                  }}
                                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-colors ${
                                    isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                  }`}
                                >
                                  <span>{g}</span>
                                  {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ↕️ Sort Dropdown */}
                  <div className="relative dropdown-trigger ml-auto">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'sort' ? null : 'sort'); }}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 transition-all bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                    >
                      <span>↕️ Sort: <strong className="text-[var(--text-primary)] font-medium">{
                        sortBy === 'reach' ? 'Top Reach' : 
                        sortBy === 'followers' ? 'Most Followers' : 
                        sortBy === 'engagement' ? 'Engagement' : 
                        sortBy === 'rate_asc' ? 'Budget: Low to High' : 'Recently Added'
                      }</strong></span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'sort' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-2 shadow-2xl dropdown-popover"
                        >
                          <div className="space-y-0.5 select-none text-xs">
                            {[
                              { id: 'reach', label: 'Top Reach' },
                              { id: 'followers', label: 'Most Followers' },
                              { id: 'engagement', label: 'Engagement Rate' },
                              { id: 'rate_asc', label: 'Budget: Low to High' },
                              { id: 'newest', label: 'Recently Added' }
                            ].map(option => {
                              const isSelected = sortBy === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSortBy(option.id);
                                    setActiveDropdown(null);
                                  }}
                                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-colors ${
                                    isSelected ? 'bg-[var(--violet)]/20 text-[var(--violet)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {isSelected && <Check size={12} className="text-[var(--violet)]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Row 2 — Creator Size chips (always visible in panel) */}
                <div className="flex flex-wrap items-center gap-3 py-2.5 border-t border-[var(--border-default)]">
                  <span className="text-xs text-[var(--text-tertiary)] font-medium">Creator Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'nano', label: 'Nano 1K–10K' },
                      { key: 'micro', label: 'Micro 10K–100K' },
                      { key: 'macro', label: 'Macro 100K–1M' },
                      { key: 'mega', label: 'Mega 1M+' },
                    ].map(tier => {
                      const isSelected = selectedFollowerRanges.includes(tier.key);
                      return (
                        <button
                          key={tier.key}
                          type="button"
                          onClick={() => toggleFollowerRange(tier.key)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            isSelected 
                              ? 'bg-[var(--violet)] text-white border border-[#7C5CFF]' 
                              : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 3 — More options (Collabs and Content type arrays) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10 py-3 border-t border-[var(--border-default)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium">Collab Mode:</span>
                    <div className="flex gap-1 p-0.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-default)]">
                      {['Paid', 'Barter', 'Both'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCollabMode(mode)}
                          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            collabMode === mode 
                              ? 'bg-[var(--violet)] text-white' 
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium font-sans">Content Type:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Reel', 'Post', 'Story', 'YT Video'].map((type) => {
                        const isSelected = selectedContentTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleContentType(type)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              isSelected 
                                ? 'bg-[var(--violet)]/15 text-[var(--violet)] border border-[var(--violet)]/20' 
                                : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Row 4 — Active filters + Clear */}
                {(selectedNiches.length > 0 || 
                  selectedPlatforms.length > 0 || 
                  selectedCities.length > 0 || 
                  selectedStates.length > 0 || 
                  selectedLanguages.length > 0 || 
                  gender !== 'Any' || 
                  selectedFollowerRanges.length > 0 || 
                  collabMode !== 'Both' || 
                  selectedContentTypes.length > 0) && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-[80%]">
                      <span className="text-xs text-[var(--text-tertiary)] mr-1">Active:</span>
                      
                      {selectedNiches.map(n => (
                        <span key={n} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {n}
                          <button type="button" onClick={() => toggleNiche(n)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {selectedPlatforms.map(p => (
                        <span key={p} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {p}
                          <button type="button" onClick={() => togglePlatform(p)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {selectedCities.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {c}
                          <button type="button" onClick={() => toggleCity(c)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {selectedStates.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {s}
                          <button type="button" onClick={() => toggleState(s)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {selectedLanguages.map(l => (
                        <span key={l} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {l}
                          <button type="button" onClick={() => toggleLanguage(l)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {gender !== 'Any' && (
                        <span className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {gender}
                          <button type="button" onClick={() => setGender('Any')} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      )}
                      {selectedFollowerRanges.map(r => (
                        <span key={r} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize">
                          {r} Size
                          <button type="button" onClick={() => toggleFollowerRange(r)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                      {collabMode !== 'Both' && (
                        <span className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {collabMode} Mode
                          <button type="button" onClick={() => setCollabMode('Both')} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      )}
                      {selectedContentTypes.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {t}
                          <button type="button" onClick={() => toggleContentType(t)} className="hover:text-[var(--text-primary)] text-[var(--text-tertiary)] font-bold ml-1">x</button>
                        </span>
                      ))}
                    </div>

                    <button 
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-[var(--violet)] hover:text-[var(--text-primary)] font-medium underline transition-colors cursor-pointer block sm:inline-block ml-auto shrink-0 select-none pb-0.5"
                    >
                      Clear All
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin"></div>
              <div className="text-[var(--text-tertiary)] text-xs font-mono tracking-widest uppercase">Loading creators...</div>
            </div>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-24 text-[var(--text-tertiary)] text-sm bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)]">
            <div className="text-4xl mb-4 opacity-55">📭</div>
            No creators found matching your selected filters.
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
            style={{
              display: "grid",
              width: "100%",
              gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))",
              gap: "24px",
              padding: "4px 4px 20px 4px",
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredCreators.map((c, i) => (
                <motion.div 
                  key={c.id || c.user_id} 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  transition={{ duration: 0.2 }}
                >
                  <CreatorCard c={c} index={i}/>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
