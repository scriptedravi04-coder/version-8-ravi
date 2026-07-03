const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.jsx', 'utf8');

// Remove Dock Sidebar completely
const dockStart = code.indexOf('{/* Dock Sidebar */}');
if (dockStart !== -1) {
  const dockEnd = code.indexOf('</aside>', dockStart) + 8;
  code = code.substring(0, dockStart) + code.substring(dockEnd);
}

// Update the remaining Sub-Sidebar to include the logo
code = code.replace(
  '<div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight mb-6">\n                Creator Hub\n              </div>',
  `<div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <LayoutGrid size={20} className="text-white" />
                </div>
                <div className="text-white font-bold text-xl tracking-tight">Ybex</div>
              </div>`
);

fs.writeFileSync('src/components/Layout.jsx', code);
