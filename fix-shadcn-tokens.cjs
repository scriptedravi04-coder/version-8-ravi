const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/--background: 240 9% 4%;/g, '--background: 0 0% 100%;');
css = css.replace(/--foreground: 0 0% 98%;/g, '--foreground: 240 10% 3.9%;');
css = css.replace(/--card: 240 11% 9%;/g, '--card: 0 0% 100%;');
css = css.replace(/--card-foreground: 0 0% 98%;/g, '--card-foreground: 240 10% 3.9%;');
css = css.replace(/--popover: 240 11% 9%;/g, '--popover: 0 0% 100%;');
css = css.replace(/--popover-foreground: 0 0% 98%;/g, '--popover-foreground: 240 10% 3.9%;');
css = css.replace(/--primary: 252 100% 68%;/g, '--primary: 252 100% 68%;');
css = css.replace(/--primary-foreground: 0 0% 100%;/g, '--primary-foreground: 0 0% 100%;');
css = css.replace(/--secondary: 240 6% 14%;/g, '--secondary: 240 4.8% 95.9%;');
css = css.replace(/--secondary-foreground: 0 0% 98%;/g, '--secondary-foreground: 240 5.9% 10%;');
css = css.replace(/--muted: 240 6% 14%;/g, '--muted: 240 4.8% 95.9%;');
css = css.replace(/--muted-foreground: 240 5% 65%;/g, '--muted-foreground: 240 3.8% 46.1%;');
css = css.replace(/--accent: 252 100% 68%;/g, '--accent: 240 4.8% 95.9%;');
css = css.replace(/--accent-foreground: 0 0% 100%;/g, '--accent-foreground: 240 5.9% 10%;');
css = css.replace(/--destructive: 0 84% 60%;/g, '--destructive: 0 84.2% 60.2%;');
css = css.replace(/--destructive-foreground: 0 0% 98%;/g, '--destructive-foreground: 0 0% 98%;');
css = css.replace(/--border: 240 6% 14%;/g, '--border: 240 5.9% 90%;');
css = css.replace(/--input: 240 6% 14%;/g, '--input: 240 5.9% 90%;');
css = css.replace(/--ring: 252 100% 68%;/g, '--ring: 252 100% 68%;');

fs.writeFileSync('src/index.css', css);
