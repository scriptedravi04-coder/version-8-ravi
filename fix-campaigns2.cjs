const fs = require('fs');
let code = fs.readFileSync('src/pages/Campaigns.jsx', 'utf8');

code = code.replace(/bg-black\/20/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/bg-black\/40/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/text-\[#9CA3AF\]/g, 'text-[var(--text-tertiary)]');
code = code.replace(/placeholder-\[#9CA3AF\]/g, 'placeholder-[var(--text-tertiary)]');
code = code.replace(/text-\[#7C5CFF\]/g, 'text-[var(--violet)]');
code = code.replace(/border-\[#7C5CFF\]/g, 'border-[var(--violet)]');
code = code.replace(/accent-\[#10B981\]/g, 'accent-emerald-500');
code = code.replace(/text-\[#10B981\]/g, 'text-emerald-500');
code = code.replace(/bg-\[#10B981\]/g, 'bg-emerald-500');
code = code.replace(/hover:bg-\[#6D42C1\]/g, 'hover:bg-[var(--violet-hover)]');

fs.writeFileSync('src/pages/Campaigns.jsx', code);
