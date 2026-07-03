const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Settings.jsx
  content = content.replace(/bg-\[#0a0a14\]/g, 'bg-[var(--bg-elevated)]');
  content = content.replace(/bg-\[#0A0A0B\]/g, 'bg-[var(--bg-card)]');
  content = content.replace(/text-\[#9CA3AF\]/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-slate-100/g, ''); // Remove explicit slate-100
  content = content.replace(/bg-black\/70/g, 'bg-[var(--bg-base)]\/70'); 

  // KycVerificationModal.jsx
  content = content.replace(/bg-\[#13131B\]/g, 'bg-[var(--bg-card)]');
  content = content.replace(/bg-\[#0e0e14\]/g, 'bg-[var(--bg-surface)]');
  content = content.replace(/bg-\[#1E1E28\]/g, 'bg-[var(--bg-elevated)]');
  content = content.replace(/bg-\[#1a1a24\]/g, 'bg-[var(--bg-surface)]');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('src/pages/Settings.jsx');
replaceInFile('src/components/KycVerificationModal.jsx');
console.log('Done replacement!');
