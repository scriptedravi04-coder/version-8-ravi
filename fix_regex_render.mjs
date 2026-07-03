import fs from 'fs';
let code = fs.readFileSync('src/pages/CampaignDetail.jsx', 'utf8');

code = code.replace(
  /setTermsAndConditions\(\/\\`Deliver 1 Instagram Reel and 1 Story promoting \\\${c\?\.brand_name \|\| "the brand"}, incorporating healthy breakfast aesthetics\. The video must show the crispy crust and fluffy interior\. Tag @goldencrust\.\\`\/\)/,
  'setTermsAndConditions(`Deliver 1 Instagram Reel and 1 Story promoting ${c?.brand_name || "the brand"}, incorporating healthy breakfast aesthetics. The video must show the crispy crust and fluffy interior. Tag @goldencrust.`)'
);

code = code.replace(
  /label: \/\\`Routing request to brand: \\\${c\?\.brand_name \|\| "the brand"}\\`\/\ /,
  'label: `Routing request to brand: ${c?.brand_name || "the brand"}` '
);

fs.writeFileSync('src/pages/CampaignDetail.jsx', code);
console.log("Success fixing RegExp render crash");
