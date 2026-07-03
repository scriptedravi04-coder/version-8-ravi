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

walkDir('src/pages', function(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  // Backgrounds
  code = code.replace(/bg-\[#16161e\]/gi, 'bg-[var(--bg-card)]');
  code = code.replace(/bg-\[#1A1A24\]\/60/gi, 'bg-[var(--bg-elevated)]');
  code = code.replace(/bg-\[#1A1A24\]\/40/gi, 'bg-[var(--bg-elevated)]');
  code = code.replace(/bg-\[#1A1A24\]/gi, 'bg-[var(--bg-card)]');
  
  // Violets
  code = code.replace(/bg-\[#7C5CFF\]/gi, 'bg-[var(--violet)]');
  code = code.replace(/text-\[#9D7CFF\]/gi, 'text-[var(--violet)]');
  code = code.replace(/text-\[#a285ff\]/gi, 'text-[var(--violet)]');
  code = code.replace(/border-\[#7C5CFF\]\/[0-9]+/gi, 'border-[var(--violet)]/20');
  code = code.replace(/bg-\[#7C3AED\]/gi, 'bg-[var(--violet)]');
  code = code.replace(/text-\[#7C3AED\]/gi, 'text-[var(--violet)]');
  
  // Update Buttons
  code = code.replace(/bg-\[var\(--violet\)\] hover:bg-\[#6D42FF\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white');
  code = code.replace(/bg-\[var\(--violet\)\] hover:bg-\[#6849E0\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white');
  code = code.replace(/bg-\[var\(--violet\)\] hover:bg-\[#6D28D9\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white');
  code = code.replace(/bg-\[var\(--violet\)\] hover:bg-\[#6D3FFF\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white');
  code = code.replace(/bg-\[var\(--violet\)\] text-\[var\(--text-primary\)\]/g, 'bg-[var(--violet)] text-white');

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code);
  }
});
