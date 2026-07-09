const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/Dashboard.jsx', 'utf8');

const target = 'const heroBanners = banners.filter(b => b.placement === "Dashboard Hero Carousel" && b.status === "Live" && b.type === (user?.role === "creator" ? "Influencer" : "Brand")).slice(0, 3);';
const replacement = `const isNewUser = !user?.kyc_verified || !user?.bank_details_added;
  const heroBanners = banners.filter(b => 
    b.placement === "Dashboard Hero Carousel" && 
    b.status === "Live" && 
    b.type === (isNewUser ? "Common" : (user?.role === "creator" ? "Influencer" : "Brand"))
  ).slice(0, 5);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/dashboard/Dashboard.jsx', code);
