const fs = require('fs');
const path = require('path');

const groups = {
  layout: ['Layout', 'YbexLogo', 'GlobalLoader'],
  dashboard: ['CreatorDashboard', 'BrandDashboard', 'StatsCard', 'QuickActions', 'ActivityFeed'],
  campaigns: ['CampaignCard', 'CampaignMiniList', 'ApplicantCard'],
  payments: ['AddPaymentMethod', 'PaymentMethodCard', 'PaymentsTable', 'InvoiceModal', 'PayNow', 'FeeBreakup', 'FeeConfigPanel'],
  creators: ['CreatorCard'],
  kyc: ['KycVerificationModal', 'KYCStatusBanner'],
  shared: ['ImageUpload', 'NotificationBell', 'NotificationItem', 'AllFiltersModal', 'PendingApprovalsTable']
};

// Create a mapping from ComponentName to its new subfolder
const componentMap = {};
for (const [group, components] of Object.entries(groups)) {
  for (const component of components) {
    componentMap[component] = group;
  }
}

function processDir(dir, depthFromSrc) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        processDir(fullPath, depthFromSrc + 1);
      }
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Calculate how to get back to src/components
      // if depthFromSrc === 0 (src itself, e.g. App.jsx), it's `./components`
      // if depthFromSrc === 1 (src/pages/ or src/components/), it's `../components` or `.`
      // if depthFromSrc === 2 (src/pages/brand/), it's `../../components`
      // if depthFromSrc === 3, it's `../../../components`
      
      let prefix = '';
      if (depthFromSrc === 0) prefix = './components';
      else {
        prefix = '../'.repeat(depthFromSrc - 1) + 'components';
      }
      
      // Regex to find imports like `import X from "../../components/ComponentName"` or `./components/X` or `../X` if inside components dir.
      // We'll just look for any import that ends with a component name in our list.
      const regex = /import\s+(?:{[^}]+}|[A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
      
      code = code.replace(regex, (match, importPath) => {
        // e.g. importPath = "../../components/CreatorDashboard"
        // parse the component name
        const parts = importPath.split('/');
        let compName = parts[parts.length - 1];
        if (compName.endsWith('.jsx')) compName = compName.slice(0, -4);
        
        if (componentMap[compName] && parts.includes('components')) {
          // It's one of our moved components!
          // We need to construct the new path.
          // the new path is [path to components] / [group] / [compName]
          // wait, what if the current file is inside `src/components/group`?
          // let's just make it relative to src/components using the prefix.
          let newImportPath = '';
          if (dir.includes('/src/components/')) {
             const currentGroup = path.basename(dir);
             if (currentGroup === componentMap[compName]) {
               newImportPath = `./${compName}`;
             } else {
               newImportPath = `../${componentMap[compName]}/${compName}`;
             }
          } else {
             newImportPath = `${prefix}/${componentMap[compName]}/${compName}`;
          }
          changed = true;
          return match.replace(importPath, newImportPath);
        }
        
        // Also if we are inside a component dir like `src/components/chat` and importing `../CreatorDashboard`
        if (dir.includes('/src/components/') && importPath.startsWith('../') && !importPath.includes('components') && componentMap[compName]) {
           const currentGroup = path.basename(dir);
           if (currentGroup === componentMap[compName]) {
             return match.replace(importPath, `./${compName}`);
           } else {
             return match.replace(importPath, `../${componentMap[compName]}/${compName}`);
           }
        }
        
        return match;
      });
      
      if (changed) {
        fs.writeFileSync(fullPath, code);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'), 0);
console.log("Imports updated.");
