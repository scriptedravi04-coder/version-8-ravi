const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.jsx', 'utf8');
// Remove theme toggle code from Layout
layout = layout.replace(/<button onClick=\{toggleTheme\}[^>]*>\{theme === "light"\s*\?\s*<Moon[^>]*\/>\s*:\s*<Sun[^>]*\/>\}<\/button>/g, '');
layout = layout.replace(/<button onClick=\{toggleTheme\}[^>]*>\s*\{theme === "light"\s*\?\s*<><Moon[^>]*\/> Dark Mode<\/>\s*:\s*<><Sun[^>]*\/> Light Mode<\/>\}\s*<\/button>/g, '');
layout = layout.replace(/<button\s*onClick=\{toggleTheme\}[^>]*>\s*\{theme === "light"\s*\?\s*<Moon[^>]*\/>\s*:\s*<Sun[^>]*\/>\}\s*<\/button>/g, '');
// There's a title="Switch to Dark Mode" button. Let's find it.
layout = layout.replace(/<button\s*onClick=\{toggleTheme\}\s*title=\{theme === "light" \? "Switch to Dark Mode" : "Switch to Day Mode"\}[^>]*>\s*\{theme === "light"\s*\?\s*<Moon[^>]*\/>\s*:\s*<Sun[^>]*\/>\}\s*<\/button>/g, '');
fs.writeFileSync('src/components/Layout.jsx', layout);
