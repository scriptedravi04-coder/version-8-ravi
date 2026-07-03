const fs = require('fs');
let code = fs.readFileSync('src/components/CampaignCard.jsx', 'utf8');

code = code.replace(/bg-\[#12121A\]/g, 'bg-[var(--bg-card)]');
code = code.replace(/bg-\[#1A1A24\]/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/hover:bg-\[#252530\]/g, 'hover:bg-[var(--border-default)]');
code = code.replace(/border-white\/\[0\.05\]/g, 'border-[var(--border-default)]');
code = code.replace(/border-white\/\[0\.02\]/g, 'border-[var(--border-default)]');

fs.writeFileSync('src/components/CampaignCard.jsx', code);
