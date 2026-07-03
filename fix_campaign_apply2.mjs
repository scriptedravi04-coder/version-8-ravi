import fs from 'fs';
let code = fs.readFileSync('src/pages/CampaignDetail.jsx', 'utf8');

const regexApply = /const handleApply = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?setApplying\(false\);\n    \}\n  \};/m;

const handleApplyNew = `const handleApply = async () => {
    if (!user) { toast.error("Please login to apply"); return; }
    if (!isCategoryMatched()) {
      toast.error("Your content category does not match this campaign's target categories.");
      return;
    }
    if (user.role !== "creator") { toast.error("Only creators can apply"); return; }
    if (pitch.length < 10) { toast.error("Please write a meaningful pitch (min 10 characters)"); return; }

    setApplying(true);
    try {
      await api.post("/campaigns/apply", { 
        campaign_id: id, 
        pitch,
      });

      setApplyModalOpen(false);
      toast.success("Application submitted successfully!");
      loadCampaignData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };`;

code = code.replace(regexApply, handleApplyNew);

const regexModalGrid = /\{\/\* 2x2 Grid for Metadata \*\/\}[\s\S]*?\{\/\* Scope & Terms \*\/\}[\s\S]*?<\/div>/m;
code = code.replace(regexModalGrid, '');

fs.writeFileSync('src/pages/CampaignDetail.jsx', code);
console.log("Replaced handleApply & removed form fields.");

