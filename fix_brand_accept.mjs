import fs from 'fs';
let code = fs.readFileSync('src/pages/BrandCampaignApplicants.jsx', 'utf8');

const targetStr = `  const handleShortlist = async (app) => {
    try {
      await api.post(\`/campaigns/\${id || campaign?.campaign_id}/applications/\${app.application_id}/action\`, { action: "accept" }).catch(async () => {
        // Fallback or Direct update in fallback scenarios
        console.warn("Direct shortlist simulation triggered");
      });
      toast.success(\`\${app.full_name} has been shortlisted! Initiating liaison secure chat.\`);
      // Route user to Brand Inbox chat thread with the creator
      navigate(\`/brand/inbox?creator_id=\${app.instagram_handle || app.username || "ravi_tech"}\`);
    } catch (err) {
      toast.error("Process error, shortlist request failed.");
    }
  };`;

const newStr = `  const handleShortlist = async (app) => {
    try {
      const { data } = await api.post(\`/campaigns/\${id || campaign?.campaign_id}/applications/\${app.application_id}/action\`, { action: "accept" });
      
      toast.success(\`\${app.full_name} has been shortlisted! Initiating secure chat.\`);
      
      if (data.thread_id) {
        // Trigger agreement generation
        await api.post(\`/chat/v2/threads/\${data.thread_id}/approve-request\`).catch(() => console.warn("Failed to generate AI agreement"));
        navigate(\`/chat/\${data.thread_id}\`);
      } else {
        navigate(\`/brand/inbox?creator_id=\${app.instagram_handle || app.username || "ravi_tech"}\`);
      }
    } catch (err) {
      toast.error("Process error, shortlist request failed.");
    }
  };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/BrandCampaignApplicants.jsx', code);
  console.log("Success");
} else {
  console.log("Target not found in BrandCampaignApplicants.jsx");
}
