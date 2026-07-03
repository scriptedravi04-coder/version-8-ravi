import fs from 'fs';
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

const oldStr = `<div className="relative z-10 flex-1 flex flex-col h-full">
               <div className="mb-4">
                 <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Important For You</h4>
                 <p className="text-xs text-[var(--text-secondary)] mt-1">Complete these steps to boost your reach</p>
               </div>
               
               <div className="flex flex-col gap-3 flex-1 justify-center mt-2 relative min-h-[140px]">
                 <div className="w-full pb-4">
                   <Link
                     to="/profile"
                     className="block bg-[var(--bg-elevated)] rounded-[1.25rem] p-5 cursor-pointer hover:bg-[var(--bg-card)] transition-all group relative border border-[var(--border-default)]"
                   >
                     <div className="flex items-center gap-2 mb-2">
                       <User size={16} className="text-blue-500 group-hover:anim-jiggle" />
                       <h5 className="font-bold text-sm text-[var(--text-primary)]">
                         Complete your profile
                       </h5>
                     </div>
                     <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                       Finish onboarding to attract top brands
                     </p>
                     <div className="w-8 h-px bg-[var(--border-default)] mb-3"></div>
                     <span className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider transition-colors flex items-center gap-1">
                       COMPLETE PROFILE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </span>
                   </Link>
                 </div>
               </div>
             </div>`;

const newStr = `<div className="relative z-10">
               <div className="mb-6">
                 <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Important For You</h4>
                 <p className="text-xs text-[var(--text-secondary)] mt-1">Complete these steps to boost your reach</p>
               </div>
               
               <div className="w-full">
                 <Link
                   to="/profile"
                   className="block bg-[var(--bg-elevated)] rounded-[1.25rem] p-5 cursor-pointer hover:bg-[var(--bg-card)] transition-all group border border-[var(--border-default)]"
                 >
                   <div className="flex items-center gap-2 mb-2">
                     <User size={16} className="text-blue-500 group-hover:anim-jiggle" />
                     <h5 className="font-bold text-sm text-[var(--text-primary)]">
                       Portfolio
                     </h5>
                   </div>
                   <div className="w-8 h-px bg-[var(--border-default)] mb-3 mt-3"></div>
                   <span className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider transition-colors flex items-center gap-1">
                     COMPLETE PROFILE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </span>
                 </Link>
               </div>
             </div>`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
console.log("Replaced");
