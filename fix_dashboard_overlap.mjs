import fs from 'fs';
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

const targetStr = '<div className="flex flex-col gap-3 flex-1 justify-center mt-2 relative min-h-[140px]">';
const newStr = '<div className="flex flex-col gap-3 flex-1 justify-start mt-2 relative overflow-y-auto no-scrollbar">';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
  console.log("Success modifying CreatorDashboard overlap");
} else {
  console.log("Not found CreatorDashboard overlap");
}
