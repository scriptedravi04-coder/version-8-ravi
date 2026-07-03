const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.js')) {
      callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  code = code.replace(/bg-\[#09090e\]/gi, 'bg-[var(--bg-base)]');
  code = code.replace(/bg-\[#0A0A0F\]/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#0f0f1a\]/gi, 'bg-[var(--bg-elevated)]');
  code = code.replace(/bg-\[#0D0D1A\]/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#0D0D13\]/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#0F0F16\]/gi, 'bg-[var(--bg-base)]');
  code = code.replace(/bg-\[#07070b\]/gi, 'bg-[var(--bg-base)]');
  code = code.replace(/bg-\[#10101a\]/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#000000\]/gi, 'bg-black');
  
  if (code !== originalCode) {
    fs.writeFileSync(filePath, code);
  }
});
