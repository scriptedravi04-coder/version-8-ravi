import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, BrainCircuit, X, Eye, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';

const mockCampaigns = [
  { id: 'c1', brand: 'Nova Brand Co', brandLogo: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=100', title: 'Summer Collection Launch', budget: 50000, deadline: '2026-07-01', applicants: 12, stage: 'Under Review', daysInReview: 3, description: 'Looking for fashion creators to promote our new summer line.', targetAudience: '18-24, Fashion, Urban', deliverables: '1 Reel, 2 Story mentions' },
  { id: 'c2', brand: 'FitTech', brandLogo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100', title: 'Smartwatch Review', budget: 20000, deadline: '2026-06-25', applicants: 0, stage: 'Under Review', daysInReview: 1, description: 'Fitness creators needed for an honest review of our active smartwatch.', targetAudience: 'Fitness enthusiasts', deliverables: '1 YouTube dedicated review' },
  { id: 'c3', brand: 'GlowCosmetics', brandLogo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100', title: 'Skincare Routine', budget: 15000, deadline: '2026-06-20', applicants: 45, stage: 'Live', daysInReview: 0, description: 'Showcase your morning skincare routine featuring our glowing serum.', targetAudience: 'Beauty, Skincare', deliverables: '1 Instagram Reel' },
];

export default function CampaignReviewQueue() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState('Under Review');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data && typeof data.ai_review_enabled === 'boolean') {
        setAiEnabled(data.ai_review_enabled);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const traverseAiToggle = async () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    try {
      await api.put('/admin/settings', { ai_review_enabled: newState });
    } catch (err) {
      console.error("Failed to update AI settings", err);
      setAiEnabled(!newState); // revert on failure
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/admin/campaigns");
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getNormalizedStage = (c) => {
    const stage = c.stage || c.status || 'Draft';
    const s = stage.toLowerCase();
    if (s === 'under review' || s === 'under_review') return 'Under Review';
    if (s === 'live' || s === 'approved') return 'Live';
    if (s === 'rejected' || s === 'review failed') return 'Rejected';
    if (s === 'draft') return 'Draft';
    return stage;
  };

  const filtered = campaigns.filter(c => getNormalizedStage(c) === filter);

  const stats = {
    'Draft': campaigns.filter(c => getNormalizedStage(c) === 'Draft').length,
    'Under Review': campaigns.filter(c => getNormalizedStage(c) === 'Under Review').length,
    'Live': campaigns.filter(c => getNormalizedStage(c) === 'Live').length,
    'Rejected': campaigns.filter(c => getNormalizedStage(c) === 'Rejected').length,
  };

  const handleAction = async (id, newStage, reason = "") => {
    try {
      const res = await api.post(`/admin/campaigns/${id}/status`, { stage: newStage, reason });
      setCampaigns(prev => prev.map(c => c.campaign_id === id ? { ...c, stage: newStage, rejectReason: reason } : c));
      setSelectedCampaign(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
       <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl w-max overflow-x-auto border border-[var(--border-default)]">
             {['Draft', 'Under Review', 'Live', 'Rejected'].map(status => (
                <button 
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${filter === status ? 'bg-[#9D7CFF] text-[var(--text-primary)]' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]'}`}
                >
                  {status}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === status ? 'bg-white/20' : 'bg-foreground/10'}`}>
                    {stats[status] || 0}
                  </span>
                </button>
             ))}
          </div>
          <div className="flex gap-2">
             <button onClick={() => setAiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl hover:bg-foreground/5 transition-colors text-sm font-semibold text-[var(--text-primary)]/80">
                <BrainCircuit size={16} className={aiEnabled ? "text-green-400" : "text-[#9D7CFF]"} /> AI Review {aiEnabled ? 'Active' : 'Settings'}
             </button>
          </div>
       </div>

       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-default)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Brand & Campaign</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status / Aging</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-foreground/5 relative">
              {filtered.map(c => (
                <tr key={c.campaign_id} className="hover:bg-foreground/5 transition-colors cursor-pointer group" onClick={() => setSelectedCampaign(c)}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={c.brand_logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold group-hover:text-[#9D7CFF] transition-colors">{c.title}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{c.brand_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">₹{c.budget_max?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)]/60">{c.deadline}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 items-start">
                       <span className="px-2.5 py-1 bg-foreground/10 border border-[var(--border-default)] rounded-full text-[10px] font-bold uppercase">{c.stage || c.status}</span>
                       {(c.stage || c.status) === 'Under Review' && c.daysInReview >= 2 && (
                          <span className={`text-[10px] font-medium flex items-center gap-1 ${c.daysInReview >= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                             <Clock size={12}/> {c.daysInReview} days in review
                          </span>
                       )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="p-2 hover:bg-foreground/10 rounded-lg text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors">
                       <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan="5" className="px-4 py-12 text-center text-[var(--text-tertiary)] italic">
                      No campaigns currently in {filter}.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
       </div>

       {/* Campaign Details Drawer */}
       {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex justify-end">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCampaign(null)}></div>
             <div className="relative z-10 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-default)] h-full flex flex-col animate-in slide-in-from-right shadow-2xl">
                <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-card)]">
                   <h2 className="font-display font-semibold text-lg">Campaign Review</h2>
                   <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-foreground/10 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                   <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-default)]">
                      <img src={selectedCampaign.brand_logo} className="w-16 h-16 rounded-xl object-cover border border-[var(--border-default)]" />
                      <div>
                         <h3 className="font-display font-bold text-xl">{selectedCampaign.title}</h3>
                         <div className="text-sm text-[var(--text-secondary)]">{selectedCampaign.brand_name}</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <label className="text-xs uppercase font-medium text-[var(--text-secondary)] tracking-wider">Description</label>
                         <p className="text-sm mt-1 text-[var(--text-primary)]/80 leading-relaxed">{selectedCampaign.description}</p>
                      </div>
                      <div>
                         <label className="text-xs uppercase font-medium text-[var(--text-secondary)] tracking-wider">Target Audience</label>
                         <div className="text-sm mt-1">{selectedCampaign.targetAudience}</div>
                      </div>
                      <div>
                         <label className="text-xs uppercase font-medium text-[var(--text-secondary)] tracking-wider">Deliverables</label>
                         <div className="text-sm mt-1 p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)] font-mono text-[var(--text-primary)]/80">{Array.isArray(selectedCampaign.deliverables) ? selectedCampaign.deliverables.join(', ') : selectedCampaign.deliverables}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-foreground/5 p-3 rounded-xl border border-[var(--border-default)]">
                            <label className="text-xs font-medium text-[var(--text-secondary)]">Budget</label>
                            <div className="font-bold text-lg mt-0.5">₹{selectedCampaign.budget_max?.toLocaleString() || selectedCampaign.budget?.toLocaleString()}</div>
                         </div>
                         <div className="bg-foreground/5 p-3 rounded-xl border border-[var(--border-default)]">
                            <label className="text-xs font-medium text-[var(--text-secondary)]">Deadline</label>
                            <div className="font-semibold text-sm mt-1.5">{selectedCampaign.deadline}</div>
                         </div>
                      </div>
                   </div>

                   {/* Moderation section if already live */}
                   {(selectedCampaign.stage || selectedCampaign.status) === 'Live' && (
                      <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                         <h4 className="font-semibold flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500"/> Moderation Actions</h4>
                         <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-amber-500/10 border border-[var(--border-default)] hover:border-amber-500/30 rounded-xl text-left transition-colors text-sm">
                               <AlertTriangle size={16} className="text-amber-500"/>
                               <div>
                                  <div className="font-medium">Flag Campaign</div>
                                  <div className="text-xs text-[var(--text-secondary)]">Keep live but highlight for review</div>
                               </div>
                            </button>
                            <button className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-red-500/10 border border-[var(--border-default)] hover:border-red-500/30 rounded-xl text-left transition-colors text-sm">
                               <XCircle size={16} className="text-red-500"/>
                               <div>
                                  <div className="font-medium text-red-400">Remove Campaign</div>
                                  <div className="text-xs text-[var(--text-secondary)]">Unpublish immediately</div>
                               </div>
                            </button>
                         </div>
                      </div>
                   )}
                </div>

                {/* Review Actions Footer */}
                {(selectedCampaign.stage || selectedCampaign.status) === 'Under Review' && (
                   <div className="p-5 border-t border-[var(--border-default)] bg-[var(--bg-card)] space-y-3">
                      <div>
                         <input 
                            type="text" 
                            placeholder="Reason for rejection / draft return..." 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                         />
                      </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => handleAction(selectedCampaign.campaign_id, "Rejected", rejectReason)}
                            disabled={!rejectReason}
                            className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                         >Reject</button>
                         <button 
                            onClick={() => handleAction(selectedCampaign.campaign_id, "Draft", rejectReason)}
                            disabled={!rejectReason}
                            className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                         >To Draft</button>
                         <button 
                            onClick={() => handleAction(selectedCampaign.campaign_id, "Live")}
                            className="flex-[2] py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-green-500/20"
                         >Approve & Publish</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       )}

        {aiModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                 <button onClick={() => setAiModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-foreground/10 rounded-full transition-colors">
                    <X size={20} />
                 </button>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#9D7CFF]/10 rounded-xl flex items-center justify-center border border-[#9D7CFF]/20">
                       <BrainCircuit size={24} className="text-[#9D7CFF]" />
                    </div>
                    <div>
                       <h3 className="font-display text-xl font-bold">AI Moderation Engine</h3>
                       <p className="text-xs text-[var(--text-secondary)]">Gemini-powered automated campaign screening</p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="p-4 bg-foreground/5 rounded-xl border border-[var(--border-default)]">
                       <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> How it works</h4>
                       <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          When a brand submits a new campaign, the AI instantly scans the title, description, and deliverables for:
                       </p>
                       <ul className="mt-3 space-y-2 text-sm text-[var(--text-primary)]/60 list-disc list-inside">
                          <li>Prohibited content (gambling, adult, illegal substances)</li>
                          <li>Contact info sharing (bypassing platform fees)</li>
                          <li>Unrealistic deliverables vs. budget ratios</li>
                          <li>Spam or scam language patterns</li>
                       </ul>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                       <div>
                          <div className="font-semibold text-sm text-[var(--text-primary)]">Auto-Reject High Risk</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-1">Automatically rejects campaigns scoring 90%+ risk.</div>
                       </div>
                       <button 
                          onClick={traverseAiToggle}
                          className={`relative w-12 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-green-500' : 'bg-foreground/20'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiEnabled ? 'left-[26px]' : 'left-1'}`} />
                       </button>
                    </div>
                 </div>

                 <button onClick={() => setAiModalOpen(false)} className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--text-secondary)] font-bold rounded-xl transition-colors">
                    Done
                 </button>
              </div>
           </div>
        )}
    </div>
  )
}
