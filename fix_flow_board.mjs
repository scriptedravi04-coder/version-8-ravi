import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const oldCheck = `{currentThread?.flow_state && currentThread?.flow_state !== "COMPLETED" && (
          <div className="mx-4 sm:mx-6 mt-4 p-5 sm:p-6 bg-[var(--bg-surface)]  text-[var(--text-primary)]  border border-[var(--border-strong)]  rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 z-20 font-sans">`;

const newCheck = `{currentThread?.flow_state && currentThread?.flow_state === "AI_AGREEMENT_READY" && (
          <div className="mx-4 sm:mx-6 mt-4 p-5 sm:p-6 bg-[var(--bg-surface)]  text-[var(--text-primary)]  border border-[var(--border-strong)]  rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 z-20 font-sans">`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
  console.log("Success modifying flow board check");
} else {
  console.log("Not found flow board check");
}
