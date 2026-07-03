const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// We'll create a role-based wrapper for /explore
code = code.replace(
  '<Route path="/explore" element={<Layout><Page><Explore /></Page></Layout>} />',
  `<Route path="/explore" element={<Layout><Page><ExploreWrapper /></Page></Layout>} />`
);

code = code.replace(
  'import Explore from "./pages/Explore";',
  `import Explore from "./pages/Explore";
import Campaigns from "./pages/Campaigns";
import { useAuth } from "./contexts/AuthContext";

function ExploreWrapper() {
  const { user } = useAuth();
  if (user?.role === 'brand') {
    return <Explore />;
  }
  return <Campaigns />;
}`
);

fs.writeFileSync('src/App.jsx', code);
