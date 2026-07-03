const fs = require('fs');

function replaceColors(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Layout and CreatorDashboard
  content = content.replace(/bg-\[#F8F9FA\]/g, 'bg-[var(--bg-base)]');
  content = content.replace(/bg-white/g, 'bg-[var(--bg-card)]');
  content = content.replace(/text-\[#111827\]/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-gray-900/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-gray-800/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-gray-500/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-gray-600/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-gray-400/g, 'text-[var(--text-tertiary)]');
  content = content.replace(/border-gray-100/g, 'border-[var(--border-default)]');
  content = content.replace(/border-gray-200/g, 'border-[var(--border-default)]');
  content = content.replace(/hover:bg-gray-50/g, 'hover:bg-[var(--bg-elevated)]');
  content = content.replace(/bg-gray-200/g, 'bg-[var(--border-strong)]');
  content = content.replace(/bg-gray-100/g, 'bg-[var(--bg-elevated)]');

  fs.writeFileSync(file, content);
}

replaceColors('src/components/Layout.jsx');
replaceColors('src/components/CreatorDashboard.jsx');
