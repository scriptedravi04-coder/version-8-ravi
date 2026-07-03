import fs from 'fs';
let code = fs.readFileSync('src/pages/BrandUGCOrders.jsx', 'utf8');

const tStr = `if (order.brand_status === 'QUALITY_REVIEW') {
               stage = "🔍 Under Quality Review";
               progress = 95;
               statusColor = "text-indigo-500";
               glow = "from-indigo-500";
            }`;

const newStr = `if (order.brand_status === 'QUALITY_REVIEW') {
               stage = "✅ Delivered!";
               progress = 100;
               statusColor = "text-green-500";
               glow = "from-green-500";
            }`;

code = code.replace(tStr, newStr);

fs.writeFileSync('src/pages/BrandUGCOrders.jsx', code);
console.log("Success modifying stage details");
