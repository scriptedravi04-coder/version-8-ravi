import fs from 'fs';
let code = fs.readFileSync('src/pages/Collabs.jsx', 'utf8');

const targetStr = `              <span className={\`text-[10px] px-2 py-1 rounded-full font-mono font-bold uppercase tracking-wider border \${
                it.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : 
                it.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : 
                "bg-red-500/10 text-red-500 border-red-500/25"
              }\`}>
                {it.status}
              </span>
              
              {user?.role === "brand" && it.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => actOnApplication(it.campaign_id, it.application_id, "accept")} 
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1"
                  >
                    <CheckCircle size={13} /> Accept
                  </button>
                  <button 
                    onClick={() => actOnApplication(it.campaign_id, it.application_id, "decline")} 
                    className="px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]/80 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Ban size={13} /> Decline
                  </button>
                </div>
              )}`;

const newStr = `              <span className={\`text-[10px] px-2 py-1 rounded-full font-mono font-bold uppercase tracking-wider border \${
                it.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : 
                it.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : 
                "bg-red-500/10 text-red-500 border-red-500/25"
              }\`}>
                {it.status}
              </span>
              
              {user?.role === "creator" && it.status === "accepted" && it.thread_id && (
                <Link
                  to={\`/chat/\${it.thread_id}\`}
                  className="px-4 py-2 bg-[#7C5CFF] hover:bg-[#6B4AFF] text-[var(--text-primary)] text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 ml-2"
                >
                  <MessageSquare size={13} /> Chat & Finalize
                </Link>
              )}
              
              {user?.role === "brand" && it.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => actOnApplication(it.campaign_id, it.application_id, "accept")} 
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1"
                  >
                    <CheckCircle size={13} /> Accept
                  </button>
                  <button 
                    onClick={() => actOnApplication(it.campaign_id, it.application_id, "decline")} 
                    className="px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]/80 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Ban size={13} /> Decline
                  </button>
                </div>
              )}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/Collabs.jsx', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
