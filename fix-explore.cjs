const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

const discoverStart = code.indexOf('<div className="pt-2 pb-1">');
const applicationsStart = code.indexOf('<Link to="/applications"');

if (discoverStart !== -1 && applicationsStart !== -1) {
  const newExplore = `<Link to="/explore" className={\`text-sm py-2.5 px-3 rounded-xl flex items-center gap-3 \${location.pathname.includes('/explore') ? 'text-white bg-[var(--violet)] font-medium shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}\`}>
                <Compass size={18} className={location.pathname.includes('/explore') ? 'text-white' : 'text-white/40'} /> Explore
              </Link>
              
              `;
  code = code.substring(0, discoverStart) + newExplore + code.substring(applicationsStart);
}

fs.writeFileSync('src/components/Layout.jsx', code);
