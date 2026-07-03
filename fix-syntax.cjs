const fs = require('fs');

function replaceSyntaxError(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    if (fs.statSync(fullPath).isDirectory()) {
      replaceSyntaxError(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/bg-\[var\(--bg-\[var\(--bg-card\)\]\)\]/g, 'bg-[var(--bg-card)]');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

replaceSyntaxError('src');
