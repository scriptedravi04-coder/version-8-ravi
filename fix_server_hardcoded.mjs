import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

code = code.replace(/Deliver 1 Instagram Reel and 1 Story promoting Golden Crust Artisanal Bread, incorporating healthy breakfast aesthetics\. Tag @goldencrust\./g, 'Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.');
code = code.replace(/The Golden Crust Bakery/g, 'Brand Partner');

fs.writeFileSync('backend/server.ts', code);
console.log("Success removing hardcoded Golden Crust");
