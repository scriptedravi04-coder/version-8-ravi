import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `          campaign_applications.push({
            application_id: a.application_id,
            campaign_id: camp.campaign_id,
            campaign_title: camp.title,
            brand_name: camp.brand_name || "Nova Brand",
            pitch: a.pitch,
            proposed_amount: a.proposed_amount,
            status: a.status,
            applied_at: a.applied_at || camp.created_at || getIsoNow(),
          });`;

const newStr = `          const thread = (db.chat_threads || []).find(t => t.campaign_id === camp.campaign_id && t.creator_id === user.user_id);
          campaign_applications.push({
            application_id: a.application_id,
            campaign_id: camp.campaign_id,
            campaign_title: camp.title,
            brand_name: camp.brand_name || "Nova Brand",
            pitch: a.pitch,
            proposed_amount: a.proposed_amount,
            status: a.status,
            applied_at: a.applied_at || camp.created_at || getIsoNow(),
            thread_id: thread?.id
          });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
