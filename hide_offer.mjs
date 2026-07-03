import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const targetStr = `              <div className="flex bg-[var(--bg-card)] border-b border-[var(--border-default)]">
                <button 
                  onClick={() => setInputMode("chat")}
                  className={\`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                    \${inputMode === "chat" ? "text-[var(--violet)] bg-[var(--bg-elevated)] border-b-2 border-[var(--violet)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}\`}
                >
                  <MessageCircle size={16} /> CHAT
                </button>
                <button 
                  onClick={() => { setInputMode("offer"); if (!offerAmount) setOfferAmount(currentThread?.amount_fixed || 3000); }}
                  className={\`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                    \${inputMode === "offer" ? "text-blue-500 bg-[var(--bg-elevated)] border-b-2 border-blue-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}\`}
                >
                  <Handshake size={16} /> NEGOTIATE OFFER
                </button>
              </div>`;

const newStr = `              <div className="flex bg-[var(--bg-card)] border-b border-[var(--border-default)]">
                <button 
                  onClick={() => setInputMode("chat")}
                  className={\`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                    \${inputMode === "chat" ? "text-[var(--violet)] bg-[var(--bg-elevated)] border-b-2 border-[var(--violet)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}\`}
                >
                  <MessageCircle size={16} /> CHAT
                </button>
                {!currentThread?.is_ugc && (
                  <button 
                    onClick={() => { setInputMode("offer"); if (!offerAmount) setOfferAmount(currentThread?.amount_fixed || 3000); }}
                    className={\`flex-1 py-3 px-4 font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors
                      \${inputMode === "offer" ? "text-blue-500 bg-[var(--bg-elevated)] border-b-2 border-blue-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}\`}
                  >
                    <Handshake size={16} /> NEGOTIATE OFFER
                  </button>
                )}
              </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
  console.log("Success hiding negotiation for UGC");
} else {
  console.log("Not found target string");
}
