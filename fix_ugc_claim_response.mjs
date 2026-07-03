import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `    saveDb(db);
    res.json({ order, internal_deadline: internalDeadline });`;

const newStr = `    saveDb(db);
    res.json({ order, internal_deadline: internalDeadline, thread_id: threadId });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying UGC claim response");
} else {
  console.log("Not found UGC claim response target");
}
