import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const oldButton = `<button
                                onClick={() => setIsNegotiatingFee(true)}
                                className="px-4 py-2.5 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-slate-100    font-semibold text-xs transition-colors border border-[var(--border-strong)]  flex items-center gap-1.5 cursor-pointer rounded-none"
                              >
                                <Handshake size={14} /> Negotiate Fee
                              </button>`;

code = code.replace(oldButton, '');

// Also clean up any other instances if needed, but this one should suffice.

fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
console.log("Success removing 'Negotiate Fee' from flow board");
