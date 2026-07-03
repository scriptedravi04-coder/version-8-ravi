import fs from 'fs';
let code = fs.readFileSync('src/pages/CampaignDetail.jsx', 'utf8');

const handleApplyOld = `  const handleApply = async () => {
    if (!user) { toast.error("Please login to apply"); return; }
    if (!isCategoryMatched()) {
      toast.error("Your content category does not match this campaign's target categories.");
      return;
    }
    if (user.role !== "creator") { toast.error("Only creators can apply"); return; }
    if (!amount || amount < 100) { toast.error("Please enter a valid rate estimate"); return; }
    if (pitch.length < 20) { toast.error("Please write a meaningful pitch (min 20 characters)"); return; }
    if (!creatorName.trim()) { toast.error("Please specify your display name"); return; }

    setApplying(true);
    try {
      // 1. Post application to backend
      const { data } = await api.post("/campaigns/apply", { 
        campaign_id: id, 
        proposed_amount: Number(amount), 
        pitch,
        creator_name: creatorName,
        creator_location: creatorLocation,
        due_date: dueDate,
        terms_and_conditions: termsAndConditions
      });

      const activeThreadId = data.thread_id;
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
        
        navigate("/inbox");
      };
      
      runStepper();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to submit application");
      setApplying(false);
    }
  };`;

const handleApplyNew = `  const handleApply = async () => {
    if (!user) { toast.error("Please login to apply"); return; }
    if (!isCategoryMatched()) {
      toast.error("Your content category does not match this campaign's target categories.");
      return;
    }
    if (user.role !== "creator") { toast.error("Only creators can apply"); return; }
    if (pitch.length < 10) { toast.error("Please write a meaningful pitch (min 10 characters)"); return; }

    setApplying(true);
    try {
      // Post application to backend
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

let replaced = false;
if (code.includes(handleApplyOld)) {
  code = code.replace(handleApplyOld, handleApplyNew);
  replaced = true;
} else {
  console.log("Could not find handleApplyOld.");
}

// Now replace the modal body
const oldModalGrid = `                {/* 2x2 Grid for Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Your Display Name *</label>
                    <input 
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-xs focus:border-[var(--violet)] outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Your Location *</label>
                    <input 
                      type="text"
                      value={creatorLocation}
                      onChange={(e) => setCreatorLocation(e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="w-full px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-xs focus:border-[var(--violet)] outline-none text-[var(--text-primary)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Project Due Date *</label>
                    <input 
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-xs focus:border-[var(--violet)] outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Sponsorship Fee (INR) *</label>
                    <div className="relative">
                      <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-xs focus:border-[var(--violet)] outline-none text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
                {/* Scope & Terms */}
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Proposed Deliverables & Terms *</label>
                  <textarea 
                    rows={3}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    placeholder="Provide friendly, human deliverables for this collaboration..."
                    className="w-full px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-xs focus:border-[var(--violet)] outline-none text-[var(--text-primary)] leading-relaxed resize-none"
                  />
                </div>`;

if (code.includes(oldModalGrid)) {
  code = code.replace(oldModalGrid, '');
  replaced = true;
} else {
  console.log("Could not find oldModalGrid.");
}

if (replaced) {
  fs.writeFileSync('src/pages/CampaignDetail.jsx', code);
  console.log("Success modifying CampaignDetail.jsx");
}

