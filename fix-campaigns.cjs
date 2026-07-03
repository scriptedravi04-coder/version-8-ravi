const fs = require('fs');
let code = fs.readFileSync('src/pages/Campaigns.jsx', 'utf8');

code = code.replace(/bg-gradient-to-br from-\[#1A1A2E\] to-\[#0D0D1A\]/g, 'bg-[var(--bg-card)]');
code = code.replace(/bg-gradient-to-b from-\[#1A1A2E\] to-\[#0D0D1A\]/g, 'bg-[var(--bg-card)]');
code = code.replace(/bg-\[#1A1A2E\]/g, 'bg-[var(--bg-elevated)]');
code = code.replace(/border-\[rgba\(255,255,255,0\.1\)\]/g, 'border-[var(--border-default)]');
code = code.replace(/border-\[rgba\(255,255,255,0\.05\)\]/g, 'border-[var(--border-default)]');
code = code.replace(/border-\[rgba\(255,255,255,0\.08\)\]/g, 'border-[var(--border-default)]');

fs.writeFileSync('src/pages/Campaigns.jsx', code);
