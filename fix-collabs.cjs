const fs = require('fs');
let code = fs.readFileSync('src/pages/Collabs.jsx', 'utf8');

// Colors replacement mapping
code = code.replace(/text-white mb-2/g, 'text-[var(--text-primary)] mb-2');
code = code.replace(/text-white\/60/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-white\/50/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-[#9D7CFF]/g, 'text-[var(--violet)]');
code = code.replace(/hover:text-white/g, 'hover:text-[var(--text-primary)]');
code = code.replace(/bg-white\/5/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/border-white\/10/g, 'border-[var(--border-default)]');
code = code.replace(/border-white\/5/g, 'border-[var(--border-default)]');
code = code.replace(/bg-\[#0e0e1a\]\/80/g, 'bg-[var(--bg-card)] shadow-sm');
code = code.replace(/text-white\/40/g, 'text-[var(--text-tertiary)]');
code = code.replace(/text-white\/30/g, 'text-[var(--text-tertiary)]');
code = code.replace(/text-white font-medium/g, 'text-[var(--text-primary)] font-medium');
code = code.replace(/bg-gradient-to-r from-\[#111827\] to-black/g, 'bg-[var(--bg-card)] shadow-sm');
code = code.replace(/text-white font-semibold/g, 'text-[var(--text-primary)] font-semibold');
code = code.replace(/text-white\/70/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-white\/55/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-white\/35/g, 'text-[var(--text-tertiary)]');
code = code.replace(/bg-\[#1e1e2d\]/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/text-emerald-400/g, 'text-emerald-600');
code = code.replace(/bg-\[#7C5CFF\]\/10/g, 'bg-[var(--violet)]/10');
code = code.replace(/text-\[#A78BFA\]/g, 'text-[var(--violet)]');
code = code.replace(/bg-\[#151525\]/g, 'bg-[var(--bg-card)] shadow-sm');
code = code.replace(/text-white/g, 'text-[var(--text-primary)]');

// But fix buttons where text-white was needed because of solid background
code = code.replace(/bg-emerald-600 text-\[var\(--text-primary\)\]/g, 'bg-emerald-600 text-white');
code = code.replace(/bg-emerald-700 text-\[var\(--text-primary\)\]/g, 'bg-emerald-700 text-white');
code = code.replace(/bg-\[#7C5CFF\]\/30 text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] text-white');
code = code.replace(/bg-\[#7C5CFF\]\/20 hover:bg-\[#7C5CFF\]\/35 text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)]/10 hover:bg-[var(--violet)]/20 text-[var(--violet)]');
code = code.replace(/bg-gradient-to-r from-\[#7C5CFF\] to-\[#9D7CFF\] hover:opacity-90 text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white');
code = code.replace(/text-\[var\(--text-primary\)\] text-xs font-bold rounded-lg shadow-md transition-colors/g, 'text-white text-xs font-bold rounded-lg shadow-md transition-colors'); // emerald button line 186
code = code.replace(/text-\[var\(--text-primary\)\] text-xs font-bold rounded-lg shadow transition-opacity whitespace-nowrap uppercase tracking-wider/g, 'text-white text-xs font-bold rounded-lg shadow transition-opacity whitespace-nowrap uppercase tracking-wider');

fs.writeFileSync('src/pages/Collabs.jsx', code);
