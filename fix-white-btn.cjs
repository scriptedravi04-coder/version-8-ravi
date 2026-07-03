const fs = require('fs');

function replaceWhiteBg(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-white text-black hover:bg-\[var\(--bg-elevated\)\]/g, 'bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--text-secondary)]');
  content = content.replace(/bg-white text-black/g, 'bg-[var(--text-primary)] text-[var(--bg-base)]');
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceWhiteBg('src/components/admin/BannerManager.jsx');
replaceWhiteBg('src/components/admin/CampaignReviewQueue.jsx');
