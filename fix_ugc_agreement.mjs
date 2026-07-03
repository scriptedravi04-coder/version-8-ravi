import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      amount_fixed: brief.budget,
      terms_and_conditions: "Deliver within 24 hours. " + brief.description,`;

const newStr = `      amount_fixed: brief.budget,
      terms_and_conditions: "Deliver within 24 hours. " + brief.description,
      ai_generated_agreement: "UGC Video Creation Agreement\\n\\n1. Scope: " + brief.description + "\\n2. Delivery Timeline: Within 24 hours of claim\\n3. Compensation: ₹" + brief.budget + " upon approval\\n4. Rights: Brand has full usage rights.",`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying UGC ai_generated_agreement");
} else {
  console.log("Not found UGC agreement target");
}
