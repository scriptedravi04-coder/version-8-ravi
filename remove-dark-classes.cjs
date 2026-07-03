const fs = require('fs');

const filesToClean = [
  'src/components/ui/calendar.jsx',
  'src/components/ui/alert.jsx',
  'src/components/NotificationBell.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Admin.jsx'
];

for (const file of filesToClean) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/dark:[^\s"']+/g, '');
    fs.writeFileSync(file, content);
  }
}
