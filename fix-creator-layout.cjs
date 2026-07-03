const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

const creatorLayoutStart = code.indexOf("if (user?.role === 'creator') {");
const creatorLayoutEnd = code.indexOf("return (", creatorLayoutStart + 10);

const newCreatorLayout = `if (user?.role === 'creator') {
      const isExactMatch = (path) => location.pathname === path;
      return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#111827] font-sans overflow-hidden">
          
          {/* Main Sidebar */}
          <aside className="w-[260px] flex-shrink-0 bg-white hidden md:flex flex-col z-10 border-r border-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
            <div className="p-8 pb-6">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-3xl tracking-tight text-[#111827]">
                  YBEX<span className="text-[var(--violet)]">.</span>
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
              <Link to="/dashboard" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/dashboard') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <LayoutGrid size={20} className={isExactMatch('/dashboard') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Dashboard
              </Link>
              
              <Link to="/explore" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${location.pathname.includes('/explore') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <Compass size={20} className={location.pathname.includes('/explore') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Discover
              </Link>
              
              <Link to="/applications" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/applications') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <FileText size={20} className={isExactMatch('/applications') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Applications
              </Link>
              
              <Link to="/deals" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/deals') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <ShieldAlert size={20} className={isExactMatch('/deals') ? 'text-[var(--violet)]' : 'text-gray-400'} /> My Deals
              </Link>
              
              <Link to="/inbox" className={\`text-sm py-3 px-4 rounded-xl flex items-center justify-between transition-all \${isExactMatch('/inbox') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <div className="flex items-center gap-4">
                  <MessageCircle size={20} className={isExactMatch('/inbox') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Inbox
                </div>
                <div className="bg-[var(--violet)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">6</div>
              </Link>

              <Link to="/earnings" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/earnings') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <Wallet size={20} className={isExactMatch('/earnings') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Earnings
              </Link>

              <div className="py-4"><div className="h-px bg-gray-100 w-full mx-auto"></div></div>

              <Link to="/profile/overview" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${location.pathname.includes('/profile') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <User size={20} className={location.pathname.includes('/profile') ? 'text-[var(--violet)]' : 'text-gray-400'} /> My Profile
              </Link>

              <Link to="/refer" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/refer') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <Gift size={20} className={isExactMatch('/refer') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Refer & Earn
              </Link>
              
              <Link to="/settings" className={\`text-sm py-3 px-4 rounded-xl flex items-center gap-4 transition-all \${isExactMatch('/settings') ? 'text-[var(--violet)] bg-[var(--violet)]/10 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'}\`}>
                <SettingsIcon size={20} className={isExactMatch('/settings') ? 'text-[var(--violet)]' : 'text-gray-400'} /> Settings
              </Link>
            </div>

            <div className="p-6 mt-auto bg-white border-t border-gray-100">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <div className={\`w-2 h-2 rounded-full \${workMode === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}\`}></div>
                  Available for Work
                </span>
                <button 
                  onClick={() => setWorkMode(workMode === 'ready' ? 'busy' : 'ready')} 
                  className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${workMode === 'ready' ? 'bg-[var(--violet)]' : 'bg-gray-200'}\`}
                >
                  <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${workMode === 'ready' ? 'translate-x-4' : 'translate-x-1'}\`} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--violet)] to-[#A78BFA] p-[2px]">
                   <img src="https://i.pravatar.cc/150?u=ravi" alt="Ravi Verma" className="w-full h-full rounded-full border-2 border-white object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">Ravi Verma</h4>
                  <p className="text-xs text-gray-500 truncate font-medium">Food Creator</p>
                </div>
              </div>
              <Link to="/profile/public" className="text-xs font-semibold text-[var(--violet)] hover:text-[#A78BFA] flex items-center gap-1.5 px-2 transition-colors">
                View Public Profile <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 relative flex flex-col min-w-0 overflow-y-auto">
             {children}
          </main>
        </div>
      );
    }
`;

code = code.substring(0, creatorLayoutStart) + newCreatorLayout + code.substring(creatorLayoutEnd);
fs.writeFileSync('src/components/Layout.jsx', code);
