const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;/g, "--font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;");
code = code.replace(/'Inter', sans-serif/g, "'Helvetica Neue', Helvetica, Arial, sans-serif");

// Set font family in theme for tailwind v4 if needed
code = code.replace(/@theme \{/, "@theme {\n  --font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;");

fs.writeFileSync('src/index.css', code);
