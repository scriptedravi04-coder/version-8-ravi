import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      agreement_signed_brand: false,
      agreement_signed_creator: false,`;

const newStr = `      agreement_signed_brand: true, // Auto-signed by brand since it's an instant order
      agreement_signed_creator: false,`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying UGC agreement_signed_brand");
} else {
  console.log("Not found UGC agreement_signed_brand target");
}
