const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

// Update imports
if (!code.includes('Compass')) {
  code = code.replace(/import \{ ([^}]+) \} from "lucide-react";/, "import { $1, Compass, ChevronDown, Gift, Banknote, ArrowRight } from \"lucide-react\";");
}

const subSidebarStart = code.indexOf('{/* Sub-Sidebar */}');
const subSidebarEnd = code.indexOf('</aside>', subSidebarStart) + 8;

const newSidebar = `{/* Sub-Sidebar */}
          <aside className="w-[260px] flex-shrink-0 bg-[#120E22] hidden md:flex flex-col z-10 border-r border-[#161324]/50">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight mb-6">
                Creator Hub
              </div>
              
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" placeholder="Search..." className="w-full bg-[#1F1C2D] text-white placeholder-white/40 text-sm rounded-lg pl-9 pr-3 py-2.5 border border-white/5 focus:outline-none focus:border-[#8A4FFF]/50 transition-colors" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">⌘K</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
              <Link to="/dashboard" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${isExactMatch('/dashboard') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <LayoutGrid size={18} className={isExactMatch('/dashboard') ? 'text-white' : 'text-white/40'} /> Dashboard
              </Link>
              
              <div className="pt-2 pb-1">
                <button onClick={() => setMenuOpen(!menuOpen)} className={\`w-full text-sm py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors \${location.pathname.includes('/discover') || menuOpen ? 'text-white bg-white/5 font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                  <div className="flex items-center gap-3">
                    <Compass size={18} className={location.pathname.includes('/discover') || menuOpen ? 'text-[#8A4FFF]' : 'text-white/40'} /> Discover
                  </div>
                  <ChevronDown size={14} className={\`text-white/40 transition-transform \${menuOpen ? 'rotate-180' : ''}\`} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="flex flex-col gap-1 pl-4 border-l border-white/10 ml-5 py-2 mt-1">
                        <Link to="/discover" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">All Campaigns</Link>
                        <Link to="/discover/ugc" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">UGC Campaigns</Link>
                        <Link to="/discover/paid" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Paid Campaigns</Link>
                        <Link to="/discover/barter" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Barter Campaigns</Link>
                        <Link to="/discover/affiliate" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Affiliate Campaigns</Link>
                        <Link to="/discover/featured" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Featured Brands</Link>
                        <Link to="/discover/trending" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Trending Opportunities</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/applications" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${isExactMatch('/applications') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <FileText size={18} className={isExactMatch('/applications') ? 'text-white' : 'text-white/40'} /> Applications
              </Link>
              
              <Link to="/deals" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${isExactMatch('/deals') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <Briefcase size={18} className={isExactMatch('/deals') ? 'text-white' : 'text-white/40'} /> My Deals
              </Link>
              
              <Link to="/inbox" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center justify-between \${isExactMatch('/inbox') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} className={isExactMatch('/inbox') ? 'text-white' : 'text-white/40'} /> Inbox
                </div>
                <div className="bg-[#8A4FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">3</div>
              </Link>

              <Link to="/earnings" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${isExactMatch('/earnings') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <Banknote size={18} className={isExactMatch('/earnings') ? 'text-white' : 'text-white/40'} /> Earnings
              </Link>

              <div className="py-2"><div className="h-px bg-white/5 w-full"></div></div>

              <div className="pb-1">
                <button onClick={() => setProfileOpen(!profileOpen)} className={\`w-full text-sm py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors \${location.pathname.includes('/profile') || profileOpen ? 'text-white bg-white/5 font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                  <div className="flex items-center gap-3">
                    <User size={18} className={location.pathname.includes('/profile') || profileOpen ? 'text-[#8A4FFF]' : 'text-white/40'} /> My Profile
                  </div>
                  <ChevronDown size={14} className={\`text-white/40 transition-transform \${profileOpen ? 'rotate-180' : ''}\`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="flex flex-col gap-1 pl-4 border-l border-white/10 ml-5 py-2 mt-1">
                        <Link to="/profile/overview" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Overview</Link>
                        <Link to="/profile/portfolio" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Portfolio</Link>
                        <Link to="/profile/analytics" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Analytics</Link>
                        <Link to="/profile/score" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Creator Score</Link>
                        <Link to="/profile/rate-card" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Rate Card</Link>
                        <Link to="/profile/social" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Social Accounts</Link>
                        <Link to="/profile/reviews" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">Brand Reviews</Link>
                        <Link to="/profile/kyc" className="text-sm py-1.5 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5">KYC & Verification</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/refer" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center justify-between \${isExactMatch('/refer') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <div className="flex items-center gap-3">
                  <Gift size={18} className={isExactMatch('/refer') ? 'text-white' : 'text-white/40'} /> Refer & Earn
                </div>
                <div className="bg-[#8A4FFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase shadow-md">New</div>
              </Link>
              
              <div className="py-2"><div className="h-px bg-white/5 w-full"></div></div>

              <Link to="/settings" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${isExactMatch('/settings') ? 'text-white bg-[#8A4FFF] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <SettingsIcon size={18} className={isExactMatch('/settings') ? 'text-white' : 'text-white/40'} /> Settings
              </Link>
            </div>

            <div className="p-4 mt-auto border-t border-white/5 bg-[#0D0B14]">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-semibold text-white/60 flex items-center gap-2">
                  <div className={\`w-2 h-2 rounded-full \${workMode === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}\`}></div>
                  Available for Work
                </span>
                <button 
                  onClick={() => setWorkMode(workMode === 'ready' ? 'busy' : 'ready')} 
                  className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${workMode === 'ready' ? 'bg-[#8A4FFF]' : 'bg-white/20'}\`}
                >
                  <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${workMode === 'ready' ? 'translate-x-4' : 'translate-x-1'}\`} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#A78BFA] p-[2px]">
                   <img src="https://i.pravatar.cc/150?u=ravi" alt="Ravi Verma" className="w-full h-full rounded-full border-2 border-[#120E22] object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">Ravi Verma</h4>
                  <p className="text-xs text-white/50 truncate">Food Creator</p>
                </div>
              </div>
              <Link to="/profile/public" className="text-[11px] font-semibold text-[#8A4FFF] hover:text-[#A78BFA] flex items-center gap-1 mt-2 px-2 transition-colors">
                View Public Profile <ArrowRight size={12} />
              </Link>
            </div>
          </aside>`;

code = code.substring(0, subSidebarStart) + newSidebar + code.substring(subSidebarEnd);
fs.writeFileSync('src/components/Layout.jsx', code);
