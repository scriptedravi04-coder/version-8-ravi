import React, { useState } from 'react';
import { ArrowRight, MessageSquare, AlertTriangle, Scale, Check, IndianRupee, ShieldAlert, FileText, Ban } from 'lucide-react';
import { api } from '../../lib/api';
import { CustomDatePicker } from '../ui/custom-date-picker';

const mockCollabs = [
  { id: 'col_123', campaign: 'Summer Launch', brand: 'Nova Brand Co', creator: 'Aarushi Jain', status: 'In Progress', escrow: 50000, deadline: '2026-06-25', lastUpdate: '2 days ago' },
  { id: 'col_124', campaign: 'Smartwatch Review', brand: 'FitTech', creator: 'Rahul Verma', status: 'Disputed', escrow: 20000, deadline: '2026-06-20', lastUpdate: '1 hour ago' },
  { id: 'col_125', campaign: 'Skincare Routine', brand: 'GlowCosmetics', creator: 'Sneha Kapoor', status: 'Delivered', escrow: 15000, deadline: '2026-06-18', lastUpdate: '12 hours ago' }
];

export default function SystemReports() {
  const [activeView, setActiveView] = useState('overview'); // overview, collab_detail, dispute_detail
  const [activeCollab, setActiveCollab] = useState(null);
  const [collabs, setCollabs] = useState([]);

  React.useEffect(() => {
    fetchCollabs();
  }, [activeView]);

  const fetchCollabs = async () => {
    try {
      const res = await api.get("/admin/system-collabs");
      setCollabs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (activeView === 'collab_detail' && activeCollab) {
     return <CollabStatusControl collab={activeCollab} onBack={() => setActiveView('overview')} />;
  }

  if (activeView === 'dispute_detail' && activeCollab) {
     return <DisputeMediation collab={activeCollab} onBack={() => setActiveView('overview')} />;
  }

  return (
    <div className="space-y-8">
       {/* Active Disputes Section (High Priority) */}
       <div>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
             <AlertTriangle size={20} /> Active Disputes Requiring Mediation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {collabs.filter(c => c.status === 'Disputed').map(c => (
                <div key={c.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 hover:border-red-500/50 transition-colors cursor-pointer group" onClick={() => { setActiveCollab(c); setActiveView('dispute_detail')}}>
                   <div className="flex justify-between items-start mb-4">
                      <div className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-full tracking-wider border border-red-500/20">Open Dispute</div>
                      <span className="text-xs text-[var(--text-secondary)]">{c.lastUpdate}</span>
                   </div>
                   <h3 className="font-semibold text-lg mb-1">{c.campaign}</h3>
                   <div className="text-sm text-[var(--text-secondary)] mb-4">{c.brand} vs {c.creator}</div>
                   <div className="flex items-center justify-between border-t border-red-500/10 pt-4">
                      <div className="text-sm"><span className="text-[var(--text-secondary)]">Escrow:</span> <span className="font-mono font-medium">₹{c.escrow?.toLocaleString() || 0}</span></div>
                      <div className="text-sm text-red-400 flex items-center gap-1 group-hover:text-red-500 font-semibold transition-colors">Resolve Option <ArrowRight size={14}/></div>
                   </div>
                </div>
             ))}
             {collabs.filter(c => c.status === 'Disputed').length === 0 && (
                <div className="col-span-full p-6 text-center text-[var(--text-secondary)] border border-dashed border-[var(--border-default)] rounded-2xl">
                   No active disputes at the moment.
                </div>
             )}
          </div>
       </div>

       {/* All Collabs Oversight */}
       <div>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
             <FileText size={20} className="text-[#9D7CFF]"/> Collab Management Oversight
          </h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-foreground/5 border-b border-[var(--border-default)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Collab ID / Campaign</th>
                      <th className="px-4 py-3 font-medium">Brand & Creator</th>
                      <th className="px-4 py-3 font-medium">Status / Deadline</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="text-sm divide-y divide-foreground/5">
                   {collabs.map(c => (
                      <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                         <td className="px-4 py-4">
                            <div className="font-mono text-xs text-[var(--text-tertiary)] mb-1">{c.id}</div>
                            <div className="font-semibold">{c.campaign}</div>
                         </td>
                         <td className="px-4 py-4">
                            <div>{c.brand}</div>
                            <div className="text-[var(--text-secondary)] text-xs mt-0.5">With: {c.creator}</div>
                         </td>
                         <td className="px-4 py-4">
                            <div className="mb-1">
                               {c.status === 'In Progress' && <span className="text-indigo-400 font-medium">In Progress</span>}
                               {c.status === 'Delivered' && <span className="text-blue-400 font-medium">Delivered (Pending Approval)</span>}
                               {c.status === 'Disputed' && <span className="text-red-500 font-medium font-bold">Disputed</span>}
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">Due: {c.deadline}</div>
                         </td>
                         <td className="px-4 py-4 text-right">
                            <button 
                               onClick={() => { setActiveCollab(c); setActiveView('collab_detail'); }}
                               className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[#9D7CFF]/50 hover:bg-foreground/5 rounded-lg text-xs font-semibold transition-colors"
                            >
                               Manage Collab
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}

function CollabStatusControl({ collab, onBack }) {
  const [overrideStatus, setOverrideStatus] = useState("");
  const [reason, setReason] = useState("");
  const [isInjectingMsg, setIsInjectingMsg] = useState(false);

  const handleForceStatus = async () => {
    try {
      await api.post(`/admin/system-collabs/${collab.id}/force-status`, { status: overrideStatus, reason });
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
       <button onClick={onBack} className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] flex items-center gap-2 mb-4">
          &larr; Back to Reports
       </button>

       <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl flex items-center justify-between">
          <div>
             <h2 className="font-display text-2xl font-bold">{collab.campaign}</h2>
             <div className="text-sm text-[var(--text-secondary)] mt-1">{collab.brand} • {collab.creator}</div>
          </div>
          <div className="text-right">
             <div className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Escrow Funds</div>
             <div className="font-mono text-xl text-green-400">₹{collab.escrow?.toLocaleString()}</div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">Collab Status Override</h3>
                <p className="text-sm text-[var(--text-primary)]/60 mb-6 leading-relaxed">
                   Admins can force-change a collaboration's status. This bypasses the normal automated triggers. Use only when necessary.
                </p>
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">New Status Target</label>
                      <select 
                         value={overrideStatus}
                         onChange={e=>setOverrideStatus(e.target.value)}
                         className="w-full p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl focus:border-[#9D7CFF] focus:outline-none text-sm"
                      >
                         <option value="">Select status...</option>
                         <option value="cancelled">Cancelled (Refund Brand)</option>
                         <option value="delivered">Force Delivered Status</option>
                         <option value="completed">Force Completed (Release Funds to Creator)</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">Reason for manual change (Mandatory log)</label>
                      <textarea 
                         value={reason}
                         onChange={e=>setReason(e.target.value)}
                         className="w-full p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl focus:border-[#9D7CFF] focus:outline-none text-sm h-24 resize-none"
                      />
                   </div>
                   <button 
                      onClick={handleForceStatus}
                      disabled={!overrideStatus || !reason}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl disabled:opacity-50 transition-colors"
                   >
                      Apply Force Status Change
                   </button>
                </div>
             </div>
             
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">Extend Deadline</h3>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <CustomDatePicker 
                        placeholder="Select extension date" 
                        className="w-full bg-[var(--bg-elevated)] border-[var(--border-default)]" 
                      />
                   </div>
                   <button className="px-6 bg-foreground/10 hover:bg-foreground/20 font-semibold rounded-xl text-sm transition-colors">Extend</button>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-3">Both parties will be notified of the deadline extension.</p>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 h-[400px] flex flex-col">
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                   <span>Admin Message Injection</span>
                   <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 uppercase">Visible to both</span>
                </h3>
                
                <div className="flex-1 bg-[var(--bg-elevated)] rounded-xl border border-foreground/5 p-4 overflow-y-auto mb-4 italic text-sm text-[var(--text-secondary)] flex flex-col justify-end">
                   [Brand and Creator conversation context history here...]
                </div>
                
                <div>
                   <select className="w-full mb-2 p-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-xs focus:border-[#9D7CFF] focus:outline-none text-[var(--text-secondary)]">
                      <option>Select a quick template...</option>
                      <option>Reminder: Deadline is approaching.</option>
                      <option>Warning: Keep communication on-platform.</option>
                      <option>Notification: Collab paused due to dispute.</option>
                   </select>
                   <textarea placeholder="Type admin message..." className="w-full h-16 p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-sm focus:border-[#9D7CFF] focus:outline-none resize-none mb-2"></textarea>
                   <button className="w-full py-2 bg-[#9D7CFF] hover:bg-[#8B6BE0] text-[var(--text-primary)] font-semibold rounded-xl text-sm transition-colors text-center">
                      Send to Chat Log
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function DisputeMediation({ collab, onBack }) {
  const [resolution, setResolution] = useState(null); // refund, partial, pay

  const handleResolve = async () => {
    try {
      await api.post(`/admin/system-collabs/${collab.id}/resolve`, { resolution });
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  return (
     <div className="w-full max-w-7xl flex flex-col h-[calc(100vh-100px)]">
       <div className="flex items-center justify-between mb-6 shrink-0">
          <button onClick={onBack} className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] flex items-center gap-2">
             &larr; Back to Reports
          </button>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={14}/> Active Dispute</div>
             <div className="text-sm font-mono text-[var(--text-secondary)]">Escrow: <span className="text-[var(--text-primary)] font-bold text-base">₹{collab.escrow?.toLocaleString() || 0}</span></div>
          </div>
       </div>

       <div className="flex flex-1 gap-6 min-h-0">
          {/* Left Panel: Brand Complaint */}
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl flex flex-col overflow-hidden">
             <div className="p-4 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
                <span className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider">Brand Claim</span>
                <h3 className="font-semibold text-lg">{collab.brand}</h3>
             </div>
             <div className="p-5 overflow-y-auto space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                   <div className="text-xs font-medium text-red-400 mb-1">Complaint Reason</div>
                   <div className="text-sm">Content quality does not match the brief and creator missed the deadline by 2 days. Requesting full refund.</div>
                </div>
                <div>
                   <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Evidence Uploaded</div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-video bg-[var(--bg-elevated)] rounded-lg flex items-center justify-center border border-[var(--border-default)] text-[var(--text-tertiary)] text-xs">Brief_PDF.pdf</div>
                      <div className="aspect-video bg-[var(--bg-elevated)] rounded-lg flex items-center justify-center border border-[var(--border-default)] text-[var(--text-tertiary)] text-xs">Chat_Log.png</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Panel: Creator Response */}
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl flex flex-col overflow-hidden">
             <div className="p-4 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
                <span className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider">Creator Response</span>
                <h3 className="font-semibold text-lg">{collab.creator}</h3>
             </div>
             <div className="p-5 overflow-y-auto space-y-4">
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                   <div className="text-xs font-medium text-blue-400 mb-1">Defense</div>
                   <div className="text-sm">Brand requested changes outside the original scope, causing the delay. The content is exactly as requested in the initial brief.</div>
                </div>
                <div>
                   <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Evidence Uploaded</div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-video bg-[var(--bg-elevated)] rounded-lg flex items-center justify-center border border-[var(--border-default)] text-[var(--text-tertiary)] text-xs">Draft_Video.mp4</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Center Panel: Admin Decision Control */}
          <div className="flex-[1.2] flex flex-col gap-4 min-h-0">
             <div className="bg-[var(--bg-card)] border border-[#9D7CFF]/30 shadow-[0_0_20px_rgba(157,124,255,0.05)] rounded-2xl p-6 flex flex-col h-full overflow-y-auto">
                <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-6"><Scale size={20} className="text-[#9D7CFF]"/> Admin Resolution</h3>
                
                <div className="space-y-3 mb-8">
                   <label className={`flex p-4 border rounded-xl cursor-pointer transition-colors ${resolution === 'refund' ? 'bg-red-500/10 border-red-500' : 'border-[var(--border-default)] hover:bg-foreground/5'}`}>
                      <input type="radio" name="resolution" className="hidden" onChange={() => setResolution('refund')} />
                      <div>
                         <div className="font-bold flex items-center gap-2 text-red-500">Full Refund <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded font-mono">₹{collab.escrow?.toLocaleString() || 0} to Brand</span></div>
                         <div className="text-xs text-[var(--text-primary)]/60 mt-1">Collab marked failed. Brand receives 100% back to wallet.</div>
                      </div>
                   </label>
                   
                   <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${resolution === 'partial' ? 'bg-amber-500/10 border-amber-500' : 'border-[var(--border-default)] hover:bg-foreground/5'}`}>
                      <div className="flex items-start">
                         <input type="radio" name="resolution" className="hidden" onChange={() => setResolution('partial')} />
                         <div>
                            <div className="font-bold text-amber-500 mb-1">Split / Partial Payout</div>
                            <div className="text-xs text-[var(--text-primary)]/60">Both parties receive a custom percentage of the escrowed amount.</div>
                         </div>
                      </div>
                      {resolution === 'partial' && (
                         <div className="mt-4 pt-4 border-t border-amber-500/20 pt-4 flex items-center gap-4 animate-in slide-in-from-top-2">
                            <div className="flex-1">
                               <label className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold mb-1 block">Brand Refund %</label>
                               <input type="number" defaultValue={50} className="w-full bg-[var(--bg-elevated)] border border-amber-500/30 rounded-lg p-2 text-center font-mono focus:outline-none" />
                            </div>
                            <div className="flex-1">
                               <label className="text-[10px] uppercase tracking-wider text-green-500/70 font-bold mb-1 block">Creator Payout %</label>
                               <input type="number" defaultValue={50} className="w-full bg-[var(--bg-elevated)] border border-green-500/30 rounded-lg p-2 text-center font-mono focus:outline-none" />
                            </div>
                         </div>
                      )}
                   </label>

                   <label className={`flex p-4 border rounded-xl cursor-pointer transition-colors ${resolution === 'pay' ? 'bg-green-500/10 border-green-500' : 'border-[var(--border-default)] hover:bg-foreground/5'}`}>
                      <input type="radio" name="resolution" className="hidden" onChange={() => setResolution('pay')} />
                      <div>
                         <div className="font-bold flex items-center gap-2 text-green-500">Release Payment <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded font-mono">₹{collab.escrow?.toLocaleString() || 0} to Creator</span></div>
                         <div className="text-xs text-[var(--text-primary)]/60 mt-1">Collab marked complete. Creator receives full payout minus standard platform fees.</div>
                      </div>
                   </label>
                </div>

                <div className="mt-auto">
                   <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Resolution Rationale (Sent to both)</label>
                   <textarea 
                      placeholder="Explain the platform's decision..." 
                      className="w-full h-24 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:outline-none focus:border-[#9D7CFF] resize-none mb-4"
                   />
                   <button 
                      onClick={handleResolve}
                      disabled={!resolution}
                      className="w-full py-4 text-black font-bold text-sm bg-gradient-to-r from-[#9D7CFF] to-[#7C5CFF] hover:to-[#6A4BE0] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(157,124,255,0.3)]"
                   >
                      <Ban size={16}/> Enforce Resolution & Close Dispute
                   </button>
                </div>
             </div>
          </div>
       </div>
     </div>
  )
}
