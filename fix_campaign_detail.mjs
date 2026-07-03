import fs from 'fs';
let code = fs.readFileSync('src/pages/CampaignDetail.jsx', 'utf8');

code = code.replace(/Golden Crust Bakery/g, '${c?.brand_name || "the brand"}');
code = code.replace(/Golden Crust Artisanal Bread/g, '${c?.brand_name || "the brand"}');

fs.writeFileSync('src/pages/CampaignDetail.jsx', code);
console.log("Replaced Golden Crust with dynamic variable in CampaignDetail.jsx");
