const fs = require('fs');
const path = require('path');

const groups = {
  layout: ['Layout.jsx', 'YbexLogo.jsx', 'GlobalLoader.jsx'],
  dashboard: ['CreatorDashboard.jsx', 'BrandDashboard.jsx', 'StatsCard.jsx', 'QuickActions.jsx', 'ActivityFeed.jsx'],
  campaigns: ['CampaignCard.jsx', 'CampaignMiniList.jsx', 'ApplicantCard.jsx'],
  payments: ['AddPaymentMethod.jsx', 'PaymentMethodCard.jsx', 'PaymentsTable.jsx', 'InvoiceModal.jsx', 'PayNow.jsx', 'FeeBreakup.jsx', 'FeeConfigPanel.jsx'],
  creators: ['CreatorCard.jsx'],
  kyc: ['KycVerificationModal.jsx', 'KYCStatusBanner.jsx'],
  shared: ['ImageUpload.jsx', 'NotificationBell.jsx', 'NotificationItem.jsx', 'AllFiltersModal.jsx', 'PendingApprovalsTable.jsx']
};

const componentsDir = path.join(__dirname, 'src', 'components');

for (const [group, files] of Object.entries(groups)) {
  const dirPath = path.join(componentsDir, group);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  for (const file of files) {
    const oldPath = path.join(componentsDir, file);
    const newPath = path.join(dirPath, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }
}
console.log("Component files moved.");
