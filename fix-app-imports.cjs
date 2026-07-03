const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  `import Explore from "./pages/Explore";
import Campaigns from "./pages/Campaigns";
import { useAuth } from "./contexts/AuthContext";

function ExploreWrapper() {
  const { user } = useAuth();
  if (user?.role === 'brand') {
    return <Explore />;
  }
  return <Campaigns />;
}
import CreatorProfile from "./pages/CreatorProfile";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";`,
  `import Explore from "./pages/Explore";
import CreatorProfile from "./pages/CreatorProfile";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";

function ExploreWrapper() {
  const { user } = useAuth();
  if (user?.role === 'brand') {
    return <Explore />;
  }
  return <Campaigns />;
}`
);

fs.writeFileSync('src/App.jsx', code);
