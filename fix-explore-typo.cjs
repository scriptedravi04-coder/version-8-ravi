const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.jsx', 'utf8');

code = code.replace(/bg-\[var\(--bg-\[var\(--bg-card\)\]\)\s*\]/g, 'bg-[var(--bg-card)]');
code = code.replace(/bg-\[var\(--bg-\[var\(--bg-card\)\]\)\]/g, 'bg-[var(--bg-card)]');

fs.writeFileSync('src/pages/Explore.jsx', code);
