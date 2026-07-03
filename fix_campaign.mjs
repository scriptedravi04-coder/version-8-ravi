import fs from 'fs';
let code = fs.readFileSync('src/pages/CampaignDetail.jsx', 'utf8');

const targetStr = `      const activeThreadId = data.thread_id;
      setApplyModalOpen(false);
      
      // 2. Open step-by-step processing stepper!
      setShowProgressModal(true);
      setProgressStep(0);
      const runStepper = async () => {
        // Step 0: "The bread campaign is launched." / Saving brief...
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(1); // "Saving created ad campaign brief..."
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(2); // "Ad campaign is in progress... applying..."
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(3); // "Processing requested campaign..."
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(4); // "Routing request to brand: \${c?.brand_name || "the brand"}..."
        
        // Trigger actual brand approval and Gemini agreement generation in backend!
        try {
          await api.post(\`/chat/v2/threads/\${activeThreadId}/approve-request\`);
        } catch (err) {
          console.error("Auto approval error:", err);
        }
        setProgressStep(5); // "Brand accepted and approved the request!"
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(6); // "Activating creator inbox..."
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(7); // "Creating humanized AI agreement..."
        
        await new Promise(r => setTimeout(r, 600));
        setProgressStep(8); // "Complete! Redirecting you..."
        
        await new Promise(r => setTimeout(r, 800));
        setShowProgressModal(false);
        toast.success("Inbox Activated successfully!");
        navigate(\`/chat/\${activeThreadId}\`);
      };
      runStepper();`;

const newStr = `      setApplyModalOpen(false);
      toast.success("Application submitted successfully! It has been moved to pending.");
      navigate("/collabs?tab=campaign_applications");`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/CampaignDetail.jsx', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
