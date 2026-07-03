const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

code = code.replace(/#8A4FFF/g, "var(--violet)");

fs.writeFileSync('src/components/Layout.jsx', code);
