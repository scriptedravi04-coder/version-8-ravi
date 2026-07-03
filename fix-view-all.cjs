const fs = require('fs');
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

// Replace specific View All buttons with Links
code = code.replace(
  '<button className="text-xs font-bold text-[var(--violet)] hover:underline">View All</button>',
  '<Link to="/profile/overview" className="text-xs font-bold text-[var(--violet)] hover:underline">View All</Link>'
);

code = code.replace(
  '<button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>',
  '<Link to="/explore" className="text-sm font-bold text-[var(--violet)] hover:underline">View All</Link>'
);

code = code.replace(
  '<button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>',
  '<Link to="/creator/ugc/orders" className="text-sm font-bold text-[var(--violet)] hover:underline">View All</Link>'
);

code = code.replace(
  '<button className="text-sm font-bold text-[var(--violet)] hover:underline">View All</button>',
  '<Link to="/profile/overview" className="text-sm font-bold text-[var(--violet)] hover:underline">View All</Link>'
);

fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
