const fs = require('fs');
const content = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');
const lines = content.split('\n');

const returnIndex = lines.findIndex((line, i) => i >= 254 && line.startsWith('  return ('));

const before = lines.slice(0, returnIndex).join('\n');

const newReturn = `  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pb-12 px-2">
      {/* Header Area */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
          Hey, {firstName} 👋
        </h2>
        <p className="text-base text-[var(--text-secondary)]">
          Ready to grow your brand today?
        </p>
      </div>

      {/* Hero Section: Banner & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* 75% Width Auto-Sliding Banner */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#101010] to-[#1A1A1A] dark:from-[#0A0A0A] dark:to-[#121212] rounded-[2rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[300px] shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-r from-[#CBFF00]/10 to-transparent mix-blend-overlay pointer-events-none"></div>
           
           <div className="relative z-10 max-w-xl">
             <div className="inline-flex items-center px-3 py-1 bg-[#CBFF00] rounded-full text-[10px] font-bold text-black uppercase tracking-widest mb-6">
               New Campaigns Live
             </div>
             
             <AnimatePresence mode="wait">
               <motion.div
                 key={widgetIndex}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.4 }}
               >
                 <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
                   {widgetIndex === 0 ? "5 New Campaigns This Week." : widgetIndex === 1 ? "Top Beauty Brands Are Hiring." : "Trending: Fitness Partnerships."}
                 </h3>
                 <p className="text-white/70 text-base md:text-lg mb-8 max-w-md font-medium">
                   Top brands. Real budgets. Right creators.
                 </p>
               </motion.div>
             </AnimatePresence>

             <button className="bg-[#CBFF00] hover:bg-[#b8e600] text-black font-bold py-3.5 px-8 rounded-2xl text-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(203,255,0,0.3)] w-fit">
               Explore Campaigns <ArrowRight size={16} className="ml-1" />
             </button>
           </div>
           
           {/* Decorative UI elements for banner */}
           <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none hidden lg:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CBFF00]/10 rounded-full blur-[80px]"></div>
              
              <div className="absolute right-12 top-16 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-4 shadow-2xl rotate-[12deg] w-40 flex flex-col gap-3">
                 <div className="w-10 h-10 rounded-[14px] bg-blue-500/80 flex items-center justify-center text-white font-bold text-lg shadow-inner">boat</div>
                 <div className="h-2 w-2/3 bg-white/20 rounded-full"></div>
                 <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
              </div>
              
              <div className="absolute right-40 bottom-12 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-4 shadow-2xl -rotate-[8deg] w-48 flex flex-col gap-3">
                 <div className="w-10 h-10 rounded-[14px] bg-red-500/80 flex items-center justify-center text-white font-bold text-lg shadow-inner">z</div>
                 <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                 <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
              </div>
           </div>
           
           {/* Dots */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
             {[0, 1, 2].map((i) => (
               <div key={i} className={\`h-1.5 rounded-full transition-all \${widgetIndex === i ? 'w-8 bg-[#CBFF00]' : 'w-2 bg-white/20'}\`} />
             ))}
           </div>
        </div>

        {/* 25% Vertical Notifications Carousel / Important Alerts */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Important For You</h4>
            <button className="text-xs font-semibold text-[var(--violet)] hover:text-[var(--violet-hover)] transition-colors">View All</button>
          </div>
          
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-start gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-colors">
              <div className="w-10 h-10 rounded-[14px] bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h5 className="font-bold text-sm text-[var(--text-primary)] truncate mb-0.5 group-hover:text-indigo-500 transition-colors">Complete your KYC</h5>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">Verify your identity to unlock all platform features.</p>
              </div>
              <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0 mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>

            <div className="flex items-start gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-colors">
              <div className="w-10 h-10 rounded-[14px] bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h5 className="font-bold text-sm text-[var(--text-primary)] truncate mb-0.5 group-hover:text-orange-500 transition-colors">Add your Rate Card</h5>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">Increase your chances of getting hired instantly.</p>
              </div>
              <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0 mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>

            <div className="flex items-start gap-4 group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-[var(--bg-elevated)] transition-colors">
              <div className="w-10 h-10 rounded-[14px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wallet size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h5 className="font-bold text-sm text-[var(--text-primary)] truncate mb-0.5 group-hover:text-emerald-500 transition-colors">2 Payments Pending</h5>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">Add bank details to receive your payouts.</p>
              </div>
              <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0 mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Compact Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {[
           { icon: Eye, label: "Profile Views", value: 1200, format: true, trend: "+18%", color: "text-[#CBFF00]", bg: "bg-[#1A1A1A] dark:bg-[#1A1A1A]", chartLine: "M0 25 L20 15 L40 20 L60 5 L80 15 L100 0" },
           { icon: AlertCircle, label: "Brand Interest", value: 32, trend: "+12%", color: "text-pink-500", bg: "bg-pink-500/10", chartLine: "M0 20 L20 25 L40 10 L60 15 L80 5 L100 10" },
           { icon: Briefcase, label: "Active Deals", value: 4, sub: "2 in review", color: "text-[#CBFF00]", bg: "bg-[#1A1A1A] dark:bg-[#1A1A1A]", chartLine: "M0 10 L20 5 L40 15 L60 10 L80 20 L100 15" },
           { icon: Wallet, label: "Earnings", value: monthlyEarnings, prefix: "₹", format: true, sub: "This month", color: "text-emerald-500", bg: "bg-emerald-500/10", chartLine: "M0 25 L20 20 L40 15 L60 20 L80 5 L100 0" }
         ].map((s, i) => (
           <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-colors flex flex-col justify-between h-[160px]">
             <div className="flex items-center gap-3 mb-2">
               <div className={\`w-12 h-12 rounded-[16px] \${s.bg} \${s.color} flex items-center justify-center\`}>
                 <s.icon size={20} />
               </div>
               <span className="text-sm font-semibold text-[var(--text-secondary)]">{s.label}</span>
             </div>
             
             <div className="flex flex-col z-10 relative">
                <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-1.5">
                  <AnimatedNumber value={s.value} format={s.format} prefix={s.prefix} />
                </div>
                {s.trend ? (
                  <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <TrendingUp size={12} /> {s.trend} this week
                  </div>
                ) : (
                  <div className="text-xs font-medium text-[var(--text-tertiary)]">
                    {s.sub}
                  </div>
                )}
             </div>
             
             {/* Mini sparkline chart bg */}
             <div className={\`absolute right-0 bottom-4 w-[60%] h-12 opacity-20 group-hover:opacity-40 transition-opacity \${s.color}\`}>
               <svg viewBox="0 0 100 30" className="w-full h-full stroke-current fill-none stroke-[3px] stroke-linecap-round stroke-linejoin-round" preserveAspectRatio="none">
                 <path d={s.chartLine} />
               </svg>
             </div>
           </div>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Recommended Campaigns & Earnings) */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Recommended Campaigns Horizontal Cards */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Recommended Opportunities</h3>
                <button className="text-sm font-semibold text-[var(--violet)] hover:text-[var(--violet-hover)] transition-colors">View All</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: 'Fitness Creator', brand: 'Nike', price: '₹18K - ₹30K', d: '5 Days Left', t: 'Reels • 2', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop', new: true },
                  { name: 'Skincare UGC', brand: 'Mamaearth', price: '₹12K - ₹22K', d: '7 Days Left', t: 'Reels • 2', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop', new: false },
                  { name: 'Food Creator', brand: 'Zomato', price: '₹15K - ₹25K', d: '4 Days Left', t: 'Shorts • 3', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop', new: false }
                ].map((c, i) => (
                  <div key={i} className="group relative rounded-[1.5rem] overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col h-[320px] shadow-sm">
                     {/* Background Image with Overlay */}
                     <div className="absolute inset-0 z-0">
                       <img src={c.img} alt={c.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/80 to-transparent"></div>
                     </div>
                     
                     <div className="relative z-10 p-6 flex flex-col h-full">
                       <div className="flex justify-between items-start mb-auto">
                         {c.new ? (
                           <span className="bg-[#CBFF00] text-black text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">New</span>
                         ) : (
                           <div></div>
                         )}
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg font-bold text-sm text-black">
                            {c.brand.charAt(0)}
                         </div>
                       </div>
                       
                       <div className="mt-auto pt-4">
                         <p className="text-xs font-semibold text-white/80 mb-1 flex items-center gap-2">
                           {c.brand}
                         </p>
                         <h4 className="font-bold text-xl text-white mb-3 group-hover:text-[#CBFF00] transition-colors leading-tight">{c.name}</h4>
                         <div className="text-[#CBFF00] font-bold text-lg mb-5 tracking-tight">{c.price}</div>
                         
                         <div className="flex items-center gap-3 text-xs font-medium text-white/70 mb-6">
                           <span className="flex items-center gap-1.5"><Film size={14} /> {c.t}</span>
                           <span className="flex items-center gap-1.5"><AlertCircle size={14} /> {c.d}</span>
                         </div>
                         
                         <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold text-white transition-colors flex justify-center items-center gap-2 group-hover:border-white/30">
                           View Details <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                         </button>
                       </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Earnings Overview */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Earnings Overview</h3>
                 <p className="text-sm text-[var(--text-secondary)] mt-1">Your income trajectory</p>
               </div>
               <div className="bg-[var(--bg-elevated)] rounded-xl p-1 flex items-center border border-[var(--border-default)]">
                 <button className="px-4 py-1.5 text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] shadow-sm rounded-lg">30D</button>
                 <button className="px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors">90D</button>
                 <button className="px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors">1Y</button>
               </div>
             </div>
             
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#CBFF00" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#CBFF00" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-default)" opacity={0.6} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500 }} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500 }} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: 'var(--text-primary)', padding: '12px 16px' }}
                     itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="profile_views" name="Earnings (₹)" stroke="#CBFF00" strokeWidth={4} fillOpacity={1} fill="url(#earningsGrad)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          
        </div>

        {/* Right Column (Brand Interest & Creator Score) */}
        <div className="flex flex-col gap-8">
          
          {/* Brand Interest Panel */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Brand Interest</h4>
              <button className="text-sm font-semibold text-[var(--violet)] hover:text-[var(--violet-hover)] transition-colors">View All</button>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { n: 'Aesop', a: 'Viewed your profile', t: '2h ago', s: 'A', bg: 'bg-[#101010] dark:bg-[#1A1A1A]', color: 'text-white' },
                { n: 'Glossier', a: 'Saved your profile', t: '1d ago', s: 'G', bg: 'bg-pink-100 dark:bg-pink-900/30', color: 'text-pink-600 dark:text-pink-400' },
                { n: 'Allbirds', a: 'Interested in collab', t: '2d ago', s: 'Al', bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-700 dark:text-slate-300' },
                { n: 'Lululemon', a: 'Viewed your profile', t: '3d ago', s: 'L', bg: 'bg-[#101010] dark:bg-[#1A1A1A]', color: 'text-white' }
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-[var(--bg-elevated)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={\`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-lg \${b.bg} \${b.color} group-hover:scale-105 transition-transform shadow-sm\`}>
                      {b.s}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[var(--text-primary)] mb-1 group-hover:text-[var(--violet)] transition-colors">{b.n}</h5>
                      <p className="text-xs font-medium text-[var(--text-secondary)]">{b.a}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{b.t}</span>
                    <div className="w-2 h-2 rounded-full bg-[#CBFF00] shadow-[0_0_8px_rgba(203,255,0,0.5)]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creator Score Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
             <div className="w-full flex justify-between items-center mb-8">
               <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Creator Score</h4>
               <span className="bg-[#CBFF00] text-black text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">Pro Tier</span>
             </div>
             
             <div className="relative w-40 h-40 flex items-center justify-center shrink-0 mb-8">
               <svg className="w-full h-full -rotate-90 transform drop-shadow-md" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" className="stroke-[var(--bg-elevated)] fill-none" strokeWidth="12" />
                 <circle cx="50" cy="50" r="40" className="stroke-[#CBFF00] fill-none" strokeWidth="12" strokeDasharray="251" strokeDashoffset="20" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-black text-[var(--text-primary)] tracking-tight">92</span>
                 <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1 tracking-widest">/ 100</span>
               </div>
             </div>
             
             <h5 className="font-bold text-lg text-[var(--text-primary)] mb-2">Excellent Work!</h5>
             <p className="text-sm font-medium text-[var(--text-secondary)] mb-8 leading-relaxed max-w-[200px] mx-auto">
               You're among the top 8% of creators in the Lifestyle & Fashion niche.
             </p>
             
             <button className="w-full py-3.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] border border-[var(--border-default)] rounded-xl text-sm font-bold text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 group">
               View Insights <ArrowRight size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors group-hover:translate-x-1" />
             </button>
          </div>
          
        </div>
      </div>
      
      {/* Apply Modal */}
      <AnimatePresence>
        {applyModalItem && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 shadow-2xl max-w-sm w-full">
                <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2 tracking-tight">Apply to Campaign</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-8 font-medium">{applyModalItem.title}</p>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setApplyModalItem(null)} className="px-5 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded-xl transition-colors">Cancel</button>
                  <button onClick={() => {setApplyModalItem(null); toast.success('Applied successfully!')}} className="px-6 py-3 text-sm font-bold text-black bg-[#CBFF00] hover:bg-[#b8e600] rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#CBFF00]/20">Apply Now</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`

fs.writeFileSync('src/components/CreatorDashboard.jsx', before + '\n' + newReturn);
