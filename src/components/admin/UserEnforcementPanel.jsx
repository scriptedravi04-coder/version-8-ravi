import React, { useState, useEffect } from 'react';
import { AlertTriangle, Ban, AlertOctagon, RotateCcw, ArrowLeft, Send, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function UserEnforcementPanel({ user, onBack, onUserUpdate }) {
  const [activeStage, setActiveStage] = useState('warning'); // warning, suspend, ban
  
  const [warningTemplate, setWarningTemplate] = useState('');
  const [warningNote, setWarningNote] = useState('');
  
  const [suspendDuration, setSuspendDuration] = useState('7');
  const [suspendReason, setSuspendReason] = useState('');

  const [banConfirmText, setBanConfirmText] = useState('');

  const [violations, setViolations] = useState([]);

  useEffect(() => {
    fetchViolations();
  }, [user.user_id]);

  const fetchViolations = async () => {
    try {
      const res = await api.get(`/admin/users/${user.user_id}/violations`);
      setViolations(res.data);
    } catch (e) {
       console.error(e);
    }
  };

  const handleAction = async (endpoint, payload) => {
     try {
        await api.post(`/admin/users/${user.user_id}/${endpoint}`, payload);
        toast.success(`Action applied successfully`);
        
        if (endpoint === 'warn') {
           setWarningTemplate('');
           setWarningNote('');
        } else if (endpoint === 'suspend') {
           setSuspendReason('');
        }
        
        fetchViolations();
        if (onUserUpdate) onUserUpdate();
     } catch (e) {
        toast.error(`Action failed`);
        console.error(e);
     }
  };

  const getPreviewText = () => {
     if (activeStage === 'warning') return `Official Warning: ${warningTemplate}${warningNote ? ` - ${warningNote}` : ''}. Continued violations may result in account suspension.`;
     if (activeStage === 'suspend') return `Account Suspended: Your account has been suspended for ${suspendDuration === 'indefinite' ? 'an indefinite period' : `${suspendDuration} days`} due to ${suspendReason || 'policy violations'}.`;
     if (activeStage === 'ban') return `Permanent Ban: Your account has been permanently banned from the platform due to repeated policy violations.`;
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
       <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] mb-4">
          <ArrowLeft size={16} /> Back to Users
       </button>

       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {user.picture ? <img src={user.picture} alt="" className="w-14 h-14 rounded-full" /> : <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center font-bold">{user.name?.charAt(0) || '?'}</div>}
             <div>
                <h2 className="font-display text-2xl font-semibold">{user.name}</h2>
                <div className="text-sm text-[var(--text-secondary)]">{user.email} • {user.role}</div>
             </div>
          </div>
          {user.banned && (
             <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl flex items-center gap-2 font-bold text-sm uppercase">
                <Ban size={16} /> Banned
             </div>
          )}
       </div>

       {/* Horizontal Stepper */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Enforcement Escalation</h3>
          <div className="flex items-center justify-between relative">
             <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 bg-foreground/10 -z-10 -translate-y-1/2"></div>
             
             <StageButton 
                active={activeStage === 'warning'} 
                icon={<AlertTriangle size={20} />} 
                label="Warning" 
                color="text-amber-500" 
                bgColor="bg-amber-500/10 border-amber-500/30"
                onClick={() => setActiveStage('warning')}
             />
             <StageButton 
                active={activeStage === 'suspend'} 
                icon={<AlertOctagon size={20} />} 
                label="Suspend" 
                color="text-orange-500" 
                bgColor="bg-orange-500/10 border-orange-500/30"
                onClick={() => setActiveStage('suspend')}
             />
             <StageButton 
                active={activeStage === 'ban'} 
                icon={<Ban size={20} />} 
                label="Permanent Ban" 
                color="text-red-500" 
                bgColor="bg-red-500/10 border-red-500/30"
                onClick={() => setActiveStage('ban')}
             />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Area */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 space-y-6">
             {activeStage === 'warning' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                   <h4 className="font-semibold text-amber-500 flex items-center gap-2"><AlertTriangle size={18} /> Issue Warning</h4>
                   <div>
                      <label className="text-xs text-[var(--text-secondary)] mb-1 block">Template</label>
                      <select value={warningTemplate} onChange={e=>setWarningTemplate(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-500">
                         <option value="">Select template...</option>
                         <option value="Inappropriate language/behavior">Inappropriate behavior</option>
                         <option value="Off-platform contact attempt">Off-platform contact</option>
                         <option value="Spamming">Spamming</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-[var(--text-secondary)] mb-1 block">Custom Note</label>
                      <textarea value={warningNote} onChange={e=>setWarningNote(e.target.value)} className="w-full h-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"></textarea>
                   </div>
                   <button 
                      onClick={() => handleAction('warn', { reason: warningTemplate + (warningNote ? ` - ${warningNote}` : '') })}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Send size={16} /> Send Warning
                   </button>
                </div>
             )}

             {activeStage === 'suspend' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                   <h4 className="font-semibold text-orange-500 flex items-center gap-2"><AlertOctagon size={18} /> Suspend Account</h4>
                   <div>
                      <label className="text-xs text-[var(--text-secondary)] mb-1 block">Duration</label>
                      <select value={suspendDuration} onChange={e=>setSuspendDuration(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500">
                         <option value="3">3 Days</option>
                         <option value="7">7 Days</option>
                         <option value="30">30 Days</option>
                         <option value="indefinite">Indefinite (Requires Admin review)</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-[var(--text-secondary)] mb-1 block">Reason</label>
                      <select value={suspendReason} onChange={e=>setSuspendReason(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500">
                         <option value="">Select reason...</option>
                         <option value="Repeated off-platform contact">Repeated off-platform contact</option>
                         <option value="Fraudulent activity">Fraudulent activity</option>
                         <option value="Failure to deliver">Failure to deliver</option>
                      </select>
                   </div>
                   <button 
                      onClick={() => handleAction('suspend', { duration: suspendDuration, reason: suspendReason })}
                      disabled={!suspendReason}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-[var(--text-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                      <AlertOctagon size={16} /> Suspend Account
                   </button>
                </div>
             )}

             {activeStage === 'ban' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                   <h4 className="font-semibold text-red-500 flex items-center gap-2"><Ban size={18} /> Permanent Ban</h4>
                   <p className="text-xs text-[var(--text-secondary)]">This action is irreversible. The user will be entirely blocked and all active sessions will be terminated.</p>
                   <div>
                      <label className="text-xs text-[var(--text-secondary)] mb-1 block">Type username to confirm</label>
                      <input 
                         type="text" 
                         value={banConfirmText} 
                         onChange={e=>setBanConfirmText(e.target.value)} 
                         placeholder={user.name}
                         className="w-full bg-[var(--bg-elevated)] border border-red-500/30 rounded-xl p-2.5 text-sm focus:outline-none focus:border-red-500"
                      />
                   </div>
                   <button 
                      disabled={banConfirmText !== user.name}
                      onClick={() => { handleAction('ban', {}); setBanConfirmText(''); }}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-[var(--text-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                   >
                      <Ban size={16} /> Ban Permanently
                   </button>
                </div>
             )}
          </div>

          <div className="space-y-6">
             {/* Notification Preview */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-3 text-[var(--text-primary)]/60">Notification Preview</h4>
                <div className="p-4 bg-[var(--bg-elevated)] border border-foreground/5 rounded-xl text-sm italic text-[var(--text-primary)]/80 leading-relaxed">
                   "{getPreviewText()}"
                </div>
             </div>

             {/* Violation History */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-4">Violation History</h4>
                {violations.length > 0 ? (
                   <div className="space-y-4">
                      {violations.map(v => (
                         <div key={v.id} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <div>
                               <div className="font-medium">{v.type} <span className="text-xs text-[var(--text-secondary)] font-normal ml-2">{v.date}</span></div>
                               <div className="text-[var(--text-secondary)] mt-0.5">{v.reason}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <p className="text-sm text-[var(--text-secondary)] italic">No past violations recorded.</p>
                )}
             </div>

             {/* Reinstate Action */}
             {(user.banned || user.suspended) && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 text-center">
                   <h4 className="font-semibold text-green-500 mb-2">Account is {user.banned ? 'Banned' : 'Suspended'}</h4>
                   <button 
                      onClick={() => handleAction('reinstate', {})}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors">
                      <RotateCcw size={16} /> Reinstate Account
                   </button>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

function StageButton({ active, icon, label, color, bgColor, onClick }) {
   return (
      <button onClick={onClick} className="flex flex-col items-center gap-2 z-10 group bg-[var(--bg-card)] transition-transform">
         <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${active ? `${bgColor} ${color} scale-110` : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-tertiary)] group-hover:border-foreground/30'}`}>
            {icon}
         </div>
         <span className={`text-xs font-semibold ${active ? color : 'text-[var(--text-secondary)]'}`}>{label}</span>
      </button>
   );
}
