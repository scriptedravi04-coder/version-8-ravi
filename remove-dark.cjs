const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/html\.dark\s*{[^}]*}/g, '');

fs.writeFileSync('src/index.css', css);
