const fs = require('fs');

let content = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

// The brutalist styling was hardcoded with bg-black text-white and border-black
content = content.replace(/bg-black text-white hover:bg-slate-800/g, 'bg-[var(--violet)] text-white hover:bg-[var(--violet-hover)]');
content = content.replace(/bg-black text-white/g, 'bg-[var(--violet)] text-white');
content = content.replace(/border-black/g, 'border-[var(--border-strong)]');
content = content.replace(/text-black/g, 'text-[var(--text-primary)]');
content = content.replace(/bg-slate-50/g, 'bg-[var(--bg-elevated)]');
content = content.replace(/bg-white/g, 'bg-[var(--bg-surface)]');
content = content.replace(/border-2/g, 'border');

fs.writeFileSync('src/components/chat/ChatBox.jsx', content);
