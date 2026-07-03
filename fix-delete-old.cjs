const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

const lines = code.split('\n');
// We want to delete from `return (` at line 184 down to `    }` at line 333.
// Wait, arrays are 0-indexed. Let's just find the exact snippet that was left behind.
const indexReturn = lines.findIndex((l, i) => i > 180 && l.trim() === 'return (');
const indexEndIf = lines.findIndex((l, i) => i > indexReturn && l.trim() === '}');

if (indexReturn !== -1 && indexEndIf !== -1) {
  lines.splice(indexReturn, indexEndIf - indexReturn + 1);
  fs.writeFileSync('src/components/Layout.jsx', lines.join('\n'));
}

