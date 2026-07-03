const fs = require('fs');

function fixChat(path) {
  let code = fs.readFileSync(path, 'utf8');

  // Fix bg-[var(--bg-elevated)] to standard tokens or keep them as bg-[var(--bg-elevated)]
  code = code.replace(/bg-\[#12121A\]/gi, 'bg-[var(--bg-base)]');
  code = code.replace(/bg-\[#1A1A2E\]\/30/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#1A1A2E\]\/50/gi, 'bg-[var(--bg-card)]/90');
  code = code.replace(/bg-\[#1A1A2E\]/gi, 'bg-[var(--bg-elevated)]');
  code = code.replace(/bg-\[#1A1A2F\]/gi, 'bg-[var(--bg-elevated)]');
  code = code.replace(/placeholder-white\/40/g, 'placeholder-[var(--text-tertiary)]');
  code = code.replace(/placeholder-white\/30/g, 'placeholder-[var(--text-tertiary)]');
  code = code.replace(/focus:border-white\/20/g, 'focus:border-[var(--violet)]');
  code = code.replace(/border-white\/20/g, 'border-[var(--border-default)]');
  code = code.replace(/hover:bg-white\/20/g, 'hover:bg-[var(--border-strong)]');
  code = code.replace(/bg-gradient-to-t from-\[#12121A\] via-\[#12121A\]/g, 'bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]');
  code = code.replace(/text-white/g, 'text-[var(--text-primary)]'); // careful, verify buttons
  code = code.replace(/bg-emerald-600 text-\[var\(--text-primary\)\]/g, 'bg-emerald-600 text-white');
  code = code.replace(/bg-\[#7C3AED\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] text-white');

  fs.writeFileSync(path, code);
}

fixChat('src/pages/Chat.jsx');
fixChat('src/components/chat/ChatBox.jsx');
