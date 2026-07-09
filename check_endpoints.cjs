const fs = require('fs');

const serverContent = fs.readFileSync('backend/server.ts', 'utf8');
const serverRoutes = [];
const regex = /router\.(get|post|put|delete|patch)\((["'`])(.*?)\2/g;
let match;
while ((match = regex.exec(serverContent)) !== null) {
  serverRoutes.push({ method: match[1].toLowerCase(), path: match[3] });
}

console.log("Server Routes:", serverRoutes.map(r => r.method.toUpperCase() + " " + r.path));
