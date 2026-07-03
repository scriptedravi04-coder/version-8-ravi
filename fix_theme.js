const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js') && !filePath.endsWith('.tsx')) return;
  
  let code = fs.readFileSync(filePath, 'utf8');
  let original = code;
  
  code = code.replace(/\btext-white\b/g, 'text-foreground');
  code = code.replace(/\bbg-white\b/g, 'bg-foreground');
  code = code.replace(/\bborder-white\b/g, 'border-foreground');

  const regex = /className=(["`'\{])(.*?)(["`'\}])/gs;
  code = code.replace(regex, (match, quoteOpen, classList, quoteClose) => {
    if (
      classList.includes('bg-[') || 
      classList.includes('bg-emerald-') || 
      classList.includes('bg-purple-') || 
      classList.includes('from-[') || 
      classList.includes('from-purple-') ||
      classList.includes('from-emerald-') ||
      classList.includes('btn-primary')
    ) {
      classList = classList.replace(/\btext-foreground\b/g, 'text-white');
    }
    return `className=${quoteOpen}${classList}${quoteClose}`;
  });

  if (code !== original) {
    fs.writeFileSync(filePath, code);
    console.log(`Updated: ${filePath}`);
  }
});
