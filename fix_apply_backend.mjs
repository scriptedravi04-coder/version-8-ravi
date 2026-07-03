import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const oldAppStr = `    const applicant = {
      application_id,
      creator_user_id: user.user_id,
      creator_name: creator_name || user.name,
      proposed_amount: proposed_amount,
      pitch: pitch,
      status: "pending",
      applied_at: getIsoNow(),
    };`;

const newAppStr = `    // Auto-fetch profile fields
    const defaultAmount = cp.rates?.reels || 15000;
    
    const applicant = {
      application_id,
      creator_user_id: user.user_id,
      creator_name: user.name,
      proposed_amount: proposed_amount || defaultAmount,
      pitch: pitch,
      status: "pending",
      applied_at: getIsoNow(),
      creator_location: cp.city + ", " + cp.state,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString()
    };`;

if (code.includes(oldAppStr)) {
  code = code.replace(oldAppStr, newAppStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying /campaigns/apply auto-fetch logic");
} else {
  console.log("Not found in backend");
}

