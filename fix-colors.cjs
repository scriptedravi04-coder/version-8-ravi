const fs = require('fs');
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

// Replace banner background
code = code.replace(/bg-gradient-to-br from-\[#101010\] to-\[#1A1A1A\] dark:from-\[#0A0A0A\] dark:to-\[#121212\]/g, "bg-gradient-to-br from-[var(--violet-bright)] to-[var(--violet)] text-white");

// Replace neon accent in banner
code = code.replace(/bg-\[#CBFF00\]/g, "bg-white");
code = code.replace(/text-\[#CBFF00\]/g, "text-[var(--violet)]");

// Replace neon accent for chart and texts
code = code.replace(/#CBFF00/g, "var(--violet)");

// Fix some specific dark colors inside the stat boxes and brand interest
code = code.replace(/bg-\[#1A1A1A\] dark:bg-\[#1A1A1A\]/g, "bg-[var(--violet-soft)]");
code = code.replace(/bg-\[#101010\] dark:bg-\[#1A1A1A\]/g, "bg-[var(--violet)]");

// The "New Campaigns Live" badge text color
code = code.replace(/text-black uppercase tracking-widest mb-6/g, "text-[var(--violet)] uppercase tracking-widest mb-6");
code = code.replace(/text-black font-bold py-3\.5/g, "text-[var(--violet)] font-bold py-3.5");

// Remove some specific explicit dark texts where primary/secondary variables apply
fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
