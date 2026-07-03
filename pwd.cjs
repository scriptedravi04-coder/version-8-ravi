console.log(process.cwd());
const fs = require('fs');
if (fs.existsSync('./public')) {
  console.log(fs.readdirSync('./public'));
}
