const fs = require('fs');
let code = fs.readFileSync('src/pages/Collabs.jsx', 'utf8');

code = code.replace(/text-foreground\/70/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-foreground\/50/g, 'text-[var(--text-secondary)]');
code = code.replace(/text-foreground\/40/g, 'text-[var(--text-tertiary)]');
code = code.replace(/border-foreground\/10/g, 'border-[var(--border-default)]');
code = code.replace(/hover:bg-card\/5/g, 'hover:bg-[var(--bg-elevated)]');
code = code.replace(/text-foreground\/85/g, 'text-[var(--text-primary)]');

fs.writeFileSync('src/pages/Collabs.jsx', code);
