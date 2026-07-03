import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const oldThreadStr = `    const threadId = \`thread_\${Math.random().toString(36).substr(2, 9)}\`;
    const newThread = {
      id: threadId,
      collab_id: order.id, 
      creator_id: user.user_id,
      brand_id: brief.brand_id,
      status: "active",
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };`;

const newThreadStr = `    const threadId = \`thread_\${Math.random().toString(36).substr(2, 9)}\`;
    const newThread = {
      id: threadId,
      collab_id: order.id, 
      is_ugc: true,
      creator_id: user.user_id,
      brand_id: brief.brand_id,
      status: "ACTIVE",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      
      // Automatic agreement for UGC
      flow_state: "AI_AGREEMENT_READY",
      amount_fixed: brief.budget,
      terms_and_conditions: "Deliver within 24 hours. " + brief.description,
      campaign_title: brief.title,
      brand_name: brief.brand_name || "Brand",
      creator_name: user.name || "Creator",
      due_date: new Date(Date.now() + 24 * 86400000).toISOString(),
      agreement_signed_brand: false,
      agreement_signed_creator: false,
      agreed_amount: brief.budget
    };`;

if (code.includes(oldThreadStr)) {
  code = code.replace(oldThreadStr, newThreadStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying UGC thread creation");
} else {
  console.log("Not found UGC thread creation");
}
