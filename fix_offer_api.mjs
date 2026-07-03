import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const tStr = `      if (thread) {
        Object.assign(thread, {
          agreed_amount: offer.amount,
          deliverables: offer.deliverables,
          deadline: offer.deadline,
          revision_count: offer.revision_count,
          breakdown: offer.breakdown,
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        });`;

const newStr = `      if (thread) {
        Object.assign(thread, {
          agreed_amount: offer.amount,
          amount_fixed: offer.amount,
          deliverables: offer.deliverables,
          deadline: offer.deadline,
          revision_count: offer.revision_count,
          breakdown: offer.breakdown,
          status: 'ACTIVE',
          flow_state: 'AI_AGREEMENT_READY',
          updated_at: new Date().toISOString()
        });`;

if (code.includes(tStr)) {
  code = code.replace(tStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying offer accept");
} else {
  console.log("Not found.");
}
