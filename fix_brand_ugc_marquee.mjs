import fs from 'fs';
let code = fs.readFileSync('src/pages/BrandUGCOrders.jsx', 'utf8');

const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        {briefs.map(brief => {`;

// Replace grid with marquee
const newGrid = `<div className="relative z-10 overflow-hidden py-4 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex gap-6 lg:gap-8 w-max marquee-track hover:[animation-play-state:paused]">
        {[...briefs, ...briefs, ...briefs].map((brief, idx) => {`;

code = code.replace(oldGrid, newGrid);

// We need to fix the map key because we duplicated briefs
const oldKey = `<div key={brief.id} className="relative group">`;
const newKey = `<div key={brief.id + "-" + idx} className="relative group w-[340px] md:w-[400px] shrink-0">`;

code = code.replace(oldKey, newKey);

fs.writeFileSync('src/pages/BrandUGCOrders.jsx', code);
console.log("Success modifying BrandUGCOrders to marquee");
