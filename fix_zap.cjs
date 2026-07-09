const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/dashboard/CreatorDashboard.jsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('Zap,')) {
    code = code.replace(/} from "lucide-react";/, '  Zap,\n} from "lucide-react";');
}

fs.writeFileSync(filePath, code);
