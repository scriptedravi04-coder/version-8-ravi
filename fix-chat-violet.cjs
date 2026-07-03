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

walkDir('src/components/chat', function(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  code = code.replace(/text-\[#7C3AED\]/gi, 'text-[var(--violet)]');
  code = code.replace(/bg-\[#7C3AED\]\/10/gi, 'bg-[var(--violet)]/10');
  code = code.replace(/bg-\[#7C3AED\]\/20/gi, 'bg-[var(--violet)]/20');
  code = code.replace(/bg-\[#7C3AED\]\/30/gi, 'bg-[var(--violet)]/30');
  code = code.replace(/border-\[#7C3AED\]\/20/gi, 'border-[var(--violet)]/20');
  code = code.replace(/border-\[#7C3AED\]\/30/gi, 'border-[var(--violet)]/30');
  code = code.replace(/bg-\[#7C3AED\]/gi, 'bg-[var(--violet)]');
  code = code.replace(/border-\[#7C3AED\]/gi, 'border-[var(--violet)]');
  code = code.replace(/shadow-\[#7C3AED\]/gi, 'shadow-[var(--violet)]');
  code = code.replace(/hover:bg-\[#7C3AED\]\/30/gi, 'hover:bg-[var(--violet)]/30');

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code);
  }
});
