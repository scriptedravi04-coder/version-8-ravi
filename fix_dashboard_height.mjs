import fs from 'fs';
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

const targetStr = '<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 lg:h-[300px]">';
const newStr = '<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 lg:min-h-[320px]">';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
  console.log("Success modifying CreatorDashboard height");
} else {
  console.log("Not found CreatorDashboard height");
}
