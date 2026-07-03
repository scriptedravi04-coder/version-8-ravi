const fs = require('fs');
let code = fs.readFileSync('src/components/CreatorDashboard.jsx', 'utf8');

code = code.replace(
  "name: 'Fitness Creator\\nCampaign'",
  "name: 'Fitness Creator Campaign'"
);
code = code.replace(
  "name: 'Skincare UGC\\nCampaign'",
  "name: 'Skincare UGC Campaign'"
);
code = code.replace(
  "name: 'Food Creator\\nCampaign'",
  "name: 'Food Creator Campaign'"
);

// If it has literal new lines we can fix it by regex:
code = code.replace(/name: 'Fitness Creator\nCampaign'/g, "name: 'Fitness Creator Campaign'");
code = code.replace(/name: 'Skincare UGC\nCampaign'/g, "name: 'Skincare UGC Campaign'");
code = code.replace(/name: 'Food Creator\nCampaign'/g, "name: 'Food Creator Campaign'");

fs.writeFileSync('src/components/CreatorDashboard.jsx', code);
