import fs from 'fs';
let code = fs.readFileSync('src/pages/BrandUGCOrders.jsx', 'utf8');

const tStr = `      </div>\n    </div>\n  );\n}`;
const newTStr = `        </div>\n      </div>\n    </div>\n  );\n}`;

if (code.includes(tStr)) {
  code = code.replace(tStr, newTStr);
  fs.writeFileSync('src/pages/BrandUGCOrders.jsx', code);
  console.log("Success adding missing closing div");
} else {
  console.log("Could not find the end token");
}
