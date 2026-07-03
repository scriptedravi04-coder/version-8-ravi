const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/--bg-base: #F4F6FA;/g, '--bg-base: #F5F6FA;');
css = css.replace(/--violet: #8B5CF6;/g, '--violet: #7C3AED;');
css = css.replace(/--violet-bright: #A78BFA;/g, '--violet-bright: #8B5CF6;');
css = css.replace(/--violet-hover: #7C3AED;/g, '--violet-hover: #5B21B6;');
css = css.replace(/--text-primary: #120E22;/g, '--text-primary: #0F172A;');
css = css.replace(/--text-secondary: #4F5975;/g, '--text-secondary: #64748B;');

css = css.replace(
  "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');",
  "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');"
);
css = css.replace(/'Helvetica Neue', Helvetica, Arial, sans-serif/g, "'Plus Jakarta Sans', sans-serif");

fs.writeFileSync('src/index.css', css);
