
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Camera, Edit2, MapPin, Instagram, Youtube, Globe, Link as LinkIcon, 
  CheckCircle, TrendingUp, ShieldCheck, Brain, Image as ImageIcon
} from "lucide-react";

export default function MyProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");

  // AIScoreCard component
  const AIScoreCard = () => (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--violet)]/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="text-[var(--violet)]" size={24} /> AI Score Card
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Real-time profile & engagement analysis</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#00f2fe] p-1 shadow-lg">
          <div className="w-full h-full bg-[var(--bg-card)] rounded-full flex items-center justify-center font-black text-xl text-[var(--text-primary)]">
            94
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-[var(--text-secondary)]">Audience Quality</span>
            <span className="font-bold text-emerald-500">Excellent</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-[var(--text-secondary)]">Engagement Consistency</span>
            <span className="font-bold text-[var(--violet)]">High</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--violet)] rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-[var(--text-secondary)]">Brand Match Potential</span>
            <span className="font-bold text-amber-500">Very Good</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-[var(--border-default)] grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Authenticity</p>
          <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500"/> 98.2%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">Growth Velocity</p>
          <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5"><TrendingUp size={16} className="text-[var(--violet)]"/> +14.5% /mo</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 py-10 pb-20" data-testid="profile-page">
      {/* Cover & Avatar Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 h-48 md:h-64 border border-[var(--border-default)] mb-16">
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80" className="w-full h-full object-cover opacity-60" />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-black/70 transition">
           <ImageIcon size={14}/> Edit Cover
        </div>
        
        <div className="absolute -bottom-12 left-8 flex items-end gap-5">
           <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[var(--bg-base)] bg-[var(--bg-card)] overflow-hidden relative group">
              <img src={user?.photo || "https://i.pravatar.cc/300"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
           </div>
        </div>
      </div>

      {/* Profile Details Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-8 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-2">
            {user?.name || "Ravi Kumar"} <CheckCircle className="text-[var(--violet)]" size={20} />
          </h1>
          <p className="text-[var(--text-secondary)] font-medium mt-1 flex items-center gap-2">
            Fashion & Lifestyle Creator <span className="text-[var(--border-default)]">|</span> <MapPin size={14}/> Mumbai, IN
          </p>
          <div className="flex gap-3 mt-4">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-[#E1306C]/10 text-[#E1306C] rounded-lg text-sm font-bold border border-[#E1306C]/20 cursor-pointer hover:bg-[#E1306C]/20 transition"><Instagram size={16}/> @ravik</span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-[#FF0000]/10 text-[#FF0000] rounded-lg text-sm font-bold border border-[#FF0000]/20 cursor-pointer hover:bg-[#FF0000]/20 transition"><Youtube size={16}/> RaviVlogs</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] font-bold rounded-xl flex items-center gap-2 hover:bg-[var(--border-default)] transition">
            <Globe size={16}/> Copy Public Link
          </button>
          <button className="px-5 py-2.5 bg-[var(--violet)] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#6D4AE5] transition shadow-lg shadow-[var(--violet)]/25">
            <Edit2 size={16}/> Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)] mb-8 overflow-x-auto hide-scrollbar">
        {["Overview", "Portfolio", "Rates & Services", "Audience"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-[var(--violet)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">About Me</h3>
                <button className="text-[var(--violet)] hover:bg-[var(--violet)]/10 p-2 rounded-xl transition"><Edit2 size={16}/></button>
             </div>
             <p className="text-[var(--text-secondary)] leading-relaxed">
               I am a passionate lifestyle and fashion creator based in Mumbai. With over 3 years of experience creating high-quality content, I specialize in aesthetic reels, style guides, and urban lifestyle photography. I've worked with top brands to drive authentic engagement and conversions.
             </p>
             <div className="mt-6 flex flex-wrap gap-2">
                {["Fashion", "Lifestyle", "Travel", "Streetwear", "Fitness"].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-xs font-semibold text-[var(--text-secondary)]">{tag}</span>
                ))}
             </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 shadow-sm">
             <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Recent Collaborations</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden border border-[var(--border-default)] aspect-[4/3] cursor-pointer">
                    <img src={`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                       <h4 className="text-white font-bold text-sm">Nike Summer Fit</h4>
                       <p className="text-white/70 text-xs font-medium">120K Views • Instagram</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <AIScoreCard />

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Rates (INR)</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#E1306C]/10 text-[#E1306C] rounded-xl flex items-center justify-center"><Instagram size={18}/></div>
                     <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm">IG Reel</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Up to 60s</p>
                     </div>
                  </div>
                  <p className="font-black text-[var(--text-primary)]">₹15,000</p>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#E1306C]/10 text-[#E1306C] rounded-xl flex items-center justify-center"><Instagram size={18}/></div>
                     <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm">IG Story</p>
                        <p className="text-xs text-[var(--text-tertiary)]">24h post</p>
                     </div>
                  </div>
                  <p className="font-black text-[var(--text-primary)]">₹5,000</p>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#FF0000]/10 text-[#FF0000] rounded-xl flex items-center justify-center"><Youtube size={18}/></div>
                     <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm">YT Integration</p>
                        <p className="text-xs text-[var(--text-tertiary)]">60-90s mention</p>
                     </div>
                  </div>
                  <p className="font-black text-[var(--text-primary)]">₹25,000</p>
               </div>
            </div>
            <button className="w-full mt-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl font-bold text-sm hover:border-[var(--violet)] hover:text-[var(--violet)] transition">
               Update Rates
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
