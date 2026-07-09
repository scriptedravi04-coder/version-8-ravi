import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Check, ChevronRight, Video, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function BrandUGCPost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    product_name: "",
    product_description: "",
    product_url: "",
    deliverable_type: "instagram_reel",
    video_duration: "30s",
    dos: [""],
    donts: [""],
    budget: 2000,
    max_creators: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateFee = () => formData.budget <= 20000 ? 5 : 2;

  const handlePost = async () => {
    setIsSubmitting(true);
    toast.info("Escrow payment initialized... (Simulating Zaakpay)");

    setTimeout(async () => {
       try {
         await api.post("/ugc/briefs", {
           title: formData.title || `Review of ${formData.product_name}`,
           ...formData,
           dos: formData.dos.filter(d => !!d),
           donts: formData.donts.filter(d => !!d),
         });
         toast.success("Brief posted successfully!");
         navigate("/brand/ugc/briefs");
       } catch (err) {
         toast.error("Failed to post brief.");
       } finally {
         setIsSubmitting(false);
       }
    }, 1500);
  };

  const Step1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Campaign Title</label>
        <input type="text" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="e.g. Try on haul for activewear" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Detailed Requirements</label>
        <textarea rows={6} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="Provide full details about exactly what you expect in the video..." value={formData.detailed_requirements || ''} onChange={e => setFormData({...formData, detailed_requirements: e.target.value})} />
      </div>
      <button onClick={() => setStep(2)} className="w-full bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white font-bold py-4 rounded-xl mt-4 active:scale-95 transition-all shadow-xl">Next: Product Info</button>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Product Name</label>
        <input type="text" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="e.g. Pro Whey Protein" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Sample Content URL (Optional)</label>
        <input type="url" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="Link to a similar video or moodboard" value={formData.sample_content_url || ''} onChange={e => setFormData({...formData, sample_content_url: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Product Description</label>
        <textarea rows={3} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="What makes it special?" value={formData.product_description} onChange={e => setFormData({...formData, product_description: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Product URL (Optional)</label>
        <input type="url" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[#7c3aed] transition-colors outline-none" placeholder="https://" value={formData.product_url} onChange={e => setFormData({...formData, product_url: e.target.value})} />
      </div>
      <div className="flex gap-3 pt-2">
         <button onClick={() => setStep(1)} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl active:scale-95 transition-all mb-4 border border-[var(--border-default)]">Back</button>
         <button onClick={() => setStep(3)} className="w-2/3 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all mb-4 shadow-xl">Next: Deliverables</button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Format</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['instagram_reel', 'instagram_story', 'youtube_short', 'ugc_raw_video'].map(type => (
            <button key={type} onClick={() => setFormData({...formData, deliverable_type: type})} className={`px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${formData.deliverable_type === type ? 'border-[#7c3aed] bg-[var(--violet)]/10 text-[var(--text-primary)] shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-elevated)] hover:border-[var(--text-tertiary)]'}`}>
              {type.replace(/_/g," ")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Duration</label>
         <div className="flex flex-wrap gap-2">
            {['15s', '30s', '60s', '90s'].map(dur => (
              <button key={dur} onClick={() => setFormData({...formData, video_duration: dur})} className={`px-5 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${formData.video_duration === dur ? 'border-[#7c3aed] bg-[var(--violet)]/10 text-[var(--text-primary)] shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-elevated)] hover:border-[var(--text-tertiary)]'}`}>
                {dur}
              </button>
            ))}
         </div>
      </div>

      <div className="pt-4">
         <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3"><CheckCircle2 size={16}/> Must DO</label>
         {formData.dos.map((v, i) => (
           <input key={"do"+i} type="text" className="w-full mb-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-emerald-500 outline-none text-sm" placeholder="e.g. Show product texture clearly" value={v} onChange={e => {
             const newDos = [...formData.dos];
             newDos[i] = e.target.value;
             setFormData({...formData, dos: newDos});
           }}/>
         ))}
         <button onClick={() => setFormData({...formData, dos: [...formData.dos, ""]})} className="text-emerald-400 text-xs font-bold transition-all hover:text-emerald-300">+ Add Rule</button>
      </div>

      <div className="pt-2">
         <label className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-3"><AlertCircle size={16}/> Must NOT DO (DON'Ts)</label>
         {formData.donts.map((v, i) => (
           <input key={"dont"+i} type="text" className="w-full mb-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:border-red-500 outline-none text-sm" placeholder="e.g. Do not mention competitor pricing" value={v} onChange={e => {
             const newDonts = [...formData.donts];
             newDonts[i] = e.target.value;
             setFormData({...formData, donts: newDonts});
           }}/>
         ))}
         <button onClick={() => setFormData({...formData, donts: [...formData.donts, ""]})} className="text-red-400 text-xs font-bold transition-all hover:text-red-300">+ Add Rule</button>
      </div>

      <div className="flex gap-3 pt-4">
         <button onClick={() => setStep(2)} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl active:scale-95 transition-all border border-[var(--border-default)]">Back</button>
         <button onClick={() => setStep(4)} className="w-2/3 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all shadow-xl">Next: Budget</button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Budget per Video (₹)</label>
        <h2 className="text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">₹{formData.budget.toLocaleString()}</h2>
        <input type="range" min="2000" max="50000" step="500" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full accent-[#7c3aed]" />
      </div>

      <div className="pt-4">
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Number of Creators Needed</label>
         <div className="flex gap-2">
            {[1,2,3,5,10].map(num => (
              <button key={num} onClick={() => setFormData({...formData, max_creators: num})} className={`w-12 h-12 rounded-xl border font-bold transition-all ${formData.max_creators === num ? 'border-[#7c3aed] bg-[var(--violet)]/10 text-[var(--text-primary)] shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-elevated)] hover:border-[var(--text-tertiary)]'}`}>
                {num}
              </button>
            ))}
         </div>
      </div>

      <div className="flex gap-3 pt-8">
         <button onClick={() => setStep(3)} className="flex-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl border border-[var(--border-default)] active:scale-95 transition-all">Back</button>
         <button onClick={() => setStep(5)} className="w-2/3 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all shadow-xl">Review & Pay</button>
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xl">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{formData.title || `Review of ${formData.product_name}`}</h3>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">{formData.product_name}</p>

        <div className="space-y-3 text-sm text-[var(--text-tertiary)] font-medium pb-6 border-b border-[var(--border-default)] mb-6">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px] font-bold">Format</span>
            <span className="uppercase tracking-wider font-bold">{formData.deliverable_type?.replace(/_/g," ")} · {formData.video_duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px] font-bold">Quantity</span>
            <span className="font-bold">{formData.max_creators} Video{formData.max_creators>1?'s':''}</span>
          </div>
          <div className="flex justify-between text-[var(--text-primary)] font-bold">
            <span className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px] font-bold">Total Budget Escrow</span>
            <span className="text-[#facc15] font-black text-lg">₹{(formData.budget * formData.max_creators).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#facc15]/10 border border-[#facc15]/20 rounded-xl p-4 flex gap-4">
           <div className="mt-1 flex-shrink-0 text-[#facc15]"><Check size={20}/></div>
           <div>
             <h4 className="font-bold text-[#facc15] text-[11px] uppercase tracking-widest mb-1.5">⚡ Delivery Promise</h4>
             <p className="text-sm text-[#facc15]/70 font-medium leading-relaxed">
               Your video will be delivered within 20-22 hours of a creator claiming this brief. You will then have 24 hours to review and approve.
             </p>
           </div>
        </div>
      </div>

      <div className="flex gap-3">
         <button disabled={isSubmitting} onClick={() => setStep(4)} className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold py-3.5 px-6 rounded-xl border border-[var(--border-default)] active:scale-95 transition-all disabled:opacity-50">Back</button>
         <button disabled={isSubmitting} onClick={handlePost} className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] disabled:opacity-50 flex items-center justify-center gap-2">
           {isSubmitting ? <span className="animate-pulse">Processing...</span> : "Secure briefly & Pay"}
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-center relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
      {/* LEFT COLUMN: FORM & STEPPER */}
      <div className="w-full flex-col flex h-full justify-center max-w-xl mx-auto lg:mx-0">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-8 tracking-tight">Create New Campaign</h1>
        {/* Stepper Header */}
        <div className="flex items-center gap-2 w-full mb-10 overflow-hidden">
          {[1,2,3,4,5].map(num => (
            <React.Fragment key={num}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors shadow-lg ${step === num ? 'bg-[var(--violet)] text-white' : step > num ? 'bg-white/20 text-[var(--text-primary)]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]'}`}>
                {step > num ? <Check size={14}/> : num}
              </div>
              {num < 5 && <div className={`h-1 flex-1 rounded-full bg-[var(--bg-elevated)] ${step > num ? 'bg-white/20' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && Step1()}
        {step === 2 && Step2()}
        {step === 3 && Step3()}
        {step === 4 && Step4()}
        {step === 5 && Step5()}
      </div>

      {/* RIGHT COLUMN: LIVE PREVIEW */}
      <div className="w-full hidden lg:flex justify-center xl:justify-end items-center">
         <div className="w-full max-w-[360px]">
           {/* Brief Live Preview Card - Compact Video Style */}
           <div className="w-full rounded-[2.5rem] overflow-hidden relative shadow-2xl bg-[var(--bg-card)] border border-[var(--border-default)] aspect-[9/16]">
              {/* Fake Video Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/30 border-none to-[#3B82F6]/10 mix-blend-screen opacity-50"></div>
              <div className="absolute inset-0 bg-[var(--bg-card)] opacity-90 -z-10 text-[var(--text-primary)]"></div>
              
              {/* Centered Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                 <Video size={48} className="mx-auto mb-4 text-[var(--text-tertiary)] drop-shadow-xl" strokeWidth={1.5} />
                 <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">{formData.title || `Review of ${formData.product_name || 'Product'}`}</h3>
                 <p className="text-[var(--text-secondary)] text-sm font-medium line-clamp-3 px-4">{formData.product_description || 'Product description goes here'}</p>
              </div>

              {/* Bottom Tags Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/80 to-transparent z-20">
                 <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="bg-[var(--violet)] text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                       {formData.deliverable_type?.replace(/_/g," ") || 'FORMAT'}
                    </div>
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                       {formData.video_duration || 'DURATION'}
                    </div>
                 </div>
                 <div className="flex justify-between items-end mt-2 border-t border-[var(--border-default)] pt-4">
                    <div className="text-[var(--text-primary)]">
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">Budget</p>
                      <p className="font-display font-black text-2xl tracking-tight">₹{(formData.budget || 0).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>
         </div>
      </div>
      </div>
    </div>
  );
}
