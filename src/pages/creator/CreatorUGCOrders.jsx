import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useLoading } from "../../contexts/LoadingContext";
import CreatorCountdown from "../../components/ugc/CreatorCountdown";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, CheckCircle, AlertTriangle, MessageCircle, FileText, ArrowRight, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorUGCOrders() {
  const [orders, setOrders] = useState([]);
  const [submitModal, setSubmitModal] = useState(null);
  const [file, setFile] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const loadData = () => {
    startLoading();
    api.get("/ugc/orders/creator").then(res => {
      setOrders(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  };

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 60000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async () => {
    if(!submitModal) return;
    toast.loading("Uploading delivery...", { id: 'dev' });
    try {
      await api.post(`/ugc/orders/${submitModal}/deliver`, { 
        video_url: "https://example.com/delivered_video.mp4",
        video_name: file ? file.name : "Uploaded_Video.mp4",
        creator_notes: ""
      });
      toast.success("Delivered successfully! Brand will review within 24h.", { id: 'dev' });
      setSubmitModal(null);
      setFile(null);
      loadData();
    } catch(e) {
      toast.error("Failed to submit", { id: 'dev' });
    }
  };

  if (orders.length === 0) {
     return (
       <div className="max-w-4xl mx-auto px-4 py-8">
         <h1 className="text-3xl font-black text-[var(--text-primary)] mb-8">My UGC Orders</h1>
         <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl">
           <p className="text-[var(--text-tertiary)] font-medium">No active UGC orders.</p>
         </div>
       </div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">My UGC Orders</h1>
      <p className="text-[var(--text-tertiary)] mb-8 font-medium">Upload deliverables before your timer runs out.</p>

      <div className="space-y-8">
        {orders.map(o => (
           <div key={o.id} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative w-full group">
              {o.creator_status === 'CLAIMED' && (
                <div className="bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
                  <CreatorCountdown internalDeadline={o.internal_deadline} />
                </div>
              )}

              {o.creator_status === 'REVISION_REQUESTED' && (
                <div className="bg-[#facc15]/10 border-b border-[#facc15]/20 py-5 px-6 md:px-8">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-[#facc15] shrink-0 mt-0.5" size={20}/>
                    <div className="w-full">
                      <h3 className="text-[#facc15] font-bold uppercase tracking-widest text-xs mb-1">Revision Requested (1/1)</h3>
                      <p className="text-[#facc15]/80 text-sm font-medium mb-4">Brand Feedback: "{o.revision_note}"</p>
                      <CreatorCountdown internalDeadline={o.internal_deadline} />
                    </div>
                  </div>
                </div>
              )}

              {o.creator_status === 'DELIVERED' && o.brand_status !== 'COMPLETED' && (
                <div className="bg-blue-500/10 border-b border-blue-500/20 py-4 px-6 md:px-8 flex items-center gap-3">
                  <Clock className="text-blue-400" size={18}/>
                  <span className="text-blue-400 font-bold text-sm tracking-wide">Delivered! Waiting for brand approval.</span>
                </div>
              )}

              {o.brand_status === 'COMPLETED' && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-4 px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={18}/>
                    <span className="text-emerald-400 font-bold text-sm tracking-wide">COMPLETED — Payout Received!</span>
                  </div>
                  <span className="text-emerald-400 font-black text-xl">₹{o.creator_payout.toLocaleString()}</span>
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{o.brief?.title || "UGC Order"}</h2>
                  <p className="text-sm text-[var(--text-tertiary)] mb-6">{o.brief?.product_name}</p>

                  <div className="space-y-4 mb-8">
                    {o.brief?.detailed_requirements && (
                      <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-2"><FileText size={12}/> Detailed Requirements</h4>
                        <p className="text-sm text-[var(--text-tertiary)] bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-default)] leading-relaxed shadow-inner">{o.brief.detailed_requirements}</p>
                      </div>
                    )}
                    {o.brief?.sample_content_url && (
                      <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1 flex items-center gap-2"><LinkIcon size={12}/> Sample Reference</h4>
                        <a href={o.brief.sample_content_url} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm text-[var(--text-primary)] hover:text-[var(--violet)] bg-[var(--bg-elevated)] px-4 py-2 rounded-lg border border-[var(--border-default)] items-center gap-2 transition-colors">
                          View Sample Content <ArrowRight size={14}/>
                        </a>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Do</h4>
                        <ul className="text-sm text-[var(--text-primary)] space-y-2">
                          {o.brief?.dos?.map((d,i) => <li key={i} className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5"><CheckCircle size={14}/></span> <span className="flex-1">{d}</span></li>)}
                        </ul>
                      </div>
                      {o.brief?.donts?.[0] && (
                        <div>
                          <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Must Not Do</h4>
                          <ul className="text-sm text-[var(--text-primary)] space-y-2">
                            {o.brief?.donts.map((d,i) => <li key={i} className="flex items-start gap-2"><span className="text-rose-500 mt-0.5"><X size={14}/></span> <span className="flex-1">{d}</span></li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {o.brand_status !== 'COMPLETED' && (
                    <div className="flex justify-between items-center bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-default)]">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Payout on Approval</span>
                      <span className="text-emerald-500 font-black text-lg">₹{o.creator_payout.toLocaleString()}</span>
                    </div>
                  )}

                </div>
                
                <div className="md:w-56 flex flex-col justify-end gap-3 shrink-0">
                  <button onClick={() => navigate(`/chat/${o.brief?.brand_id || o.brand_id}`)} className="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-[var(--border-default)] text-xs shadow-sm">
                    <MessageCircle size={16}/> Message Brand
                  </button>
                  {(o.creator_status === 'CLAIMED' || o.creator_status === 'REVISION_REQUESTED') && (
                    <button onClick={() => setSubmitModal(o.id)} className="w-full bg-[var(--violet)] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(124,58,237,0.4)] text-xs">
                      <Upload size={16}/> Submit Video
                    </button>
                  )}
                </div>
              </div>
           </div>
        ))}
      </div>

      <AnimatePresence>
        {submitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSubmitModal(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y: 20}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.95, opacity:0, y: 20}} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl">
               <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Submit Deliverable</h3>
               
               <div className="border border-dashed border-white/20 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center text-center hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer" onClick={() => document.getElementById('vid-upload').click()}>
                 <div className="w-12 h-12 bg-[var(--violet)]/20 rounded-full flex items-center justify-center text-[var(--violet)] mb-3">
                   <Upload size={20} />
                 </div>
                 <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{file ? file.name : "Click to select MP4/MOV"}</p>
                 <p className="text-xs text-[var(--text-secondary)] font-medium">Max 500MB</p>
                 <input type="file" id="vid-upload" className="hidden" accept="video/mp4,video/quicktime" onChange={(e) => setFile(e.target.files[0])} />
               </div>

               <div className="relative mb-8">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-default)]"></div></div>
                 <div className="relative flex justify-center text-sm"><span className="bg-[var(--bg-card)] px-2 text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px]">OR</span></div>
               </div>

               <div className="mb-8">
                 <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 flex items-center gap-2"><LinkIcon size={12}/> Drive / Dropbox Link</label>
                 <input type="url" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="https://" />
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setSubmitModal(null)} className="flex-1 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl border border-[var(--border-default)] active:scale-95 transition-transform text-sm">Cancel</button>
                 <button onClick={handleSubmit} className="flex-1 bg-[var(--violet)] hover:bg-[#6d28d9] text-[var(--text-primary)] font-bold py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg text-sm">Submit Video</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
