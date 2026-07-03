const fs = require('fs');

function fixFile(path) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');

  // Colors replacement mapping
  code = code.replace(/text-white mb-2/g, 'text-[var(--text-primary)] mb-2');
  code = code.replace(/text-white\/60/g, 'text-[var(--text-secondary)]');
  code = code.replace(/text-white\/50/g, 'text-[var(--text-secondary)]');
  code = code.replace(/text-white\/40/g, 'text-[var(--text-tertiary)]');
  code = code.replace(/text-white\/30/g, 'text-[var(--text-tertiary)]');
  code = code.replace(/text-[#9D7CFF]/g, 'text-[var(--violet)]');
  code = code.replace(/hover:text-white/g, 'hover:text-[var(--text-primary)]');
  code = code.replace(/bg-white\/5/g, 'bg-[var(--bg-elevated)]');
  code = code.replace(/bg-white\/10/g, 'bg-[var(--bg-elevated)]');
  code = code.replace(/hover:bg-white\/15/g, 'hover:bg-[var(--border-default)]');
  code = code.replace(/border-white\/10/g, 'border-[var(--border-default)]');
  code = code.replace(/border-white\/5/g, 'border-[var(--border-default)]');
  code = code.replace(/bg-\[#0e0e1a\]/g, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#131224\]/g, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-gradient-to-r from-\[#111827\] to-black/g, 'bg-[var(--bg-card)]');
  code = code.replace(/text-white font-medium/g, 'text-[var(--text-primary)] font-medium');
  code = code.replace(/text-white font-semibold/g, 'text-[var(--text-primary)] font-semibold');
  code = code.replace(/text-white\/70/g, 'text-[var(--text-secondary)]');
  code = code.replace(/text-white\/55/g, 'text-[var(--text-secondary)]');
  code = code.replace(/text-white\/35/g, 'text-[var(--text-tertiary)]');
  code = code.replace(/bg-\[#1e1e2d\]/g, 'bg-[var(--bg-elevated)]');
  code = code.replace(/text-emerald-400/g, 'text-emerald-600');
  code = code.replace(/bg-\[#7C5CFF\]\/10/g, 'bg-[var(--violet)]\/10');
  code = code.replace(/text-\[#A78BFA\]/g, 'text-[var(--violet)]');
  code = code.replace(/bg-\[#151525\]/g, 'bg-[var(--bg-card)]');
  code = code.replace(/text-white/g, 'text-[var(--text-primary)]');

  // Fix buttons that need white text
  code = code.replace(/bg-emerald-600 text-\[var\(--text-primary\)\]/g, 'bg-emerald-600 text-white');
  code = code.replace(/bg-emerald-700 text-\[var\(--text-primary\)\]/g, 'bg-emerald-700 text-white');
  code = code.replace(/bg-emerald-500 text-\[var\(--text-primary\)\]/g, 'bg-emerald-500 text-white');
  code = code.replace(/bg-\[#7C5CFF\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] text-white');
  code = code.replace(/bg-\[#7C5CFF\]\/30 text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] text-white');
  code = code.replace(/text-\[var\(--text-primary\)\] w-full/g, 'text-[var(--text-primary)] w-full'); // careful with this
  code = code.replace(/bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-xl text-xs font-bold text-\[var\(--text-primary\)\]/g, 'bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-xl text-xs font-bold text-white');
  code = code.replace(/bg-\[#7C5CFF\] text-\[var\(--text-primary\)\] w-full py-3/g, 'bg-[var(--violet)] text-white w-full py-3');

  fs.writeFileSync(path, code);
}

fixFile('src/pages/CampaignDetail.jsx');
fixFile('src/pages/Campaigns.jsx');
fixFile('src/pages/Explore.jsx');
fixFile('src/pages/DealDetail.jsx');
fixFile('src/pages/Dashboard.jsx');

