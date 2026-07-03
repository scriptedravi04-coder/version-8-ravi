import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const oldOfferBtn = `                           await api.post(\`/chat/v2/threads/\${thread.id}/messages\`, {
                             content: \`I would like to negotiate the offer to ₹\${offerAmount}.\`,
                             message_type: 'negotiation_offer',
                             metadata: { proposed_amount: Number(offerAmount) }
                           });`;

const newOfferBtn = `                           await api.post(\`/chat/v2/threads/\${thread.id}/offer\`, {
                             amount: Number(offerAmount),
                             deliverables: ["Content creation", "Revisions"],
                             deadline: new Date(Date.now() + 7*86400*1000).toISOString(),
                             revision_count: 1,
                             breakdown: []
                           });`;

if (code.includes(oldOfferBtn)) {
  code = code.replace(oldOfferBtn, newOfferBtn);
  fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
  console.log("Success modifying ChatBox offer button");
} else {
  console.log("Not found ChatBox offer button");
}

