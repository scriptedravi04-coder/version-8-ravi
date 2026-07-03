import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import PayNow from "../components/PayNow";
import { X, CheckCircle, Ban, HelpCircle, Briefcase, FileText, Send, Sparkles, MessageSquare } from "lucide-react";

export default function Collabs() {
  const { user } = useAuth();
  const [data, setData] = useState({ 
    sent: [], 
    received: [], 
    waves_sent: [], 
    waves_received: [], 
    campaign_applications: [] 
  });
  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get("tab") || "campaign_applications";
  const [tab, setTab] = useState(initialTab);
  const [payingCollab, setPayingCollab] = useState(null);

  const load = () => api.get("/collabs").then(({data}) => setData(data)).catch(() => {});
  
  useEffect(() => {
    load();
    // Default to received if no applications but received collabs are present
    if (tab === "campaign_applications" && data.campaign_applications?.length === 0 && data.received?.length > 0) {
      setTab("received");
    }
  }, []);

  // Accept or decline regular handshakes/collabs
  const act = async (cid, action) => {
    try { 
      await api.post(`/collabs/${cid}/action?action=${action}`); 
      toast.success(`Collaboration proposal ${action}ed successfully.`); 
      load(); 
    } catch(e) { 
      toast.error("Action failed"); 
    }
  };

  // Accept or decline campaign applications
  const actOnApplication = async (campaignId, applicationId, action) => {
    try {
      await api.post(`/campaigns/${campaignId}/applications/${applicationId}/action`, { action });
      toast.success(`Application has been ${action === "accept" ? "accepted & linked" : "declined"}!`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not process campaign application action.");
    }
  };

  const tabs = [
    { id: "campaign_applications", label: "Campaign Applications", count: data.campaign_applications?.length || 0 },
    { id: "received", label: "Received Collabs", count: data.received?.length || 0 },
    { id: "sent", label: "Sent Collabs", count: data.sent?.length || 0 },
    { id: "waves_received", label: "Waves Received", count: data.waves_received?.length || 0 },
    { id: "waves_sent", label: "Waves Sent", count: data.waves_sent?.length || 0 },
  ];

  const items = data[tab] || [];

  return (
    <div className="w-full max-w-none px-4 md:px-8 py-10 relative" data-testid="collabs-page">
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight text-[var(--text-primary)] mb-2">Collaborations & Proposals</h1>
      <p className="text-[var(--text-secondary)] text-sm">Review, negotiate, and process contracts, applications, and creator waves.</p>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-[var(--border-default)] overflow-x-auto scroll-thin">
        {tabs.map(t => (
          <button 
            key={t.id} 
            data-testid={`tab-${t.id}`} 
            onClick={() => setTab(t.id)} 
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              tab === t.id ? "border-collabs-tab border-[#7C5CFF] text-[var(--violet)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.id === "campaign_applications" && <FileText size={15} />}
            {t.id === "received" && <Briefcase size={15} />}
            {t.id === "waves_received" && <Sparkles size={15} />}
            <span>{t.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              tab === t.id ? "bg-[var(--violet)] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List Container */}
      <div className="space-y-4 mt-6">
        {items.length === 0 && (
          <div className="bg-[var(--bg-card)] shadow-sm border border-[var(--border-default)] rounded-2xl p-16 text-left text-[var(--text-tertiary)] max-w-xl ml-0 flex flex-col items-start justify-start">
            <HelpCircle size={36} className="text-[#7C5CFF]/60 mb-3" />
            <span className="text-sm font-medium">No items in the &ldquo;{tabs.find(t => t.id === tab)?.label}&rdquo; tab yet.</span>
            <p className="text-[var(--text-tertiary)] text-xs mt-1 leading-relaxed">
              When new invitations or application listings are created, they will compile in this list.
            </p>
          </div>
        )}

        {/* Regular Collabs & Waves render */}
        {tab !== "campaign_applications" && items.map((it, i) => (
          <div key={it.collab_id || it.wave_id || i} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap hover:border-[var(--violet)] transition-all shadow-sm">
            <div>
              <div className="font-display text-lg text-[var(--text-primary)] font-medium">{it.from_name || it.to_user_id}</div>
              {it.deliverable && <div className="text-sm text-[var(--text-secondary)]">{it.deliverable} · ₹{(it.proposed_amount || 0).toLocaleString("en-IN")}</div>}
              {it.message && <div className="text-sm text-[var(--text-secondary)] mt-1 italic leading-relaxed">&ldquo;{it.message}&rdquo;</div>}
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-mono">{new Date(it.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              {it.status && (
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-mono font-semibold uppercase tracking-wider ${
                  it.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" : 
                  it.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15" : 
                  "bg-red-500/10 text-red-400 border border-red-500/15"
                }`}>
                  {it.status}
                </span>
              )}
              {tab === "received" && it.status === "pending" && (
                <>
                  <button onClick={() => act(it.collab_id, "accept")} data-testid={`accept-${it.collab_id}`} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 whitespace-nowrap rounded-lg shadow transition-all">Accept</button>
                  <button onClick={() => act(it.collab_id, "decline")} data-testid={`decline-${it.collab_id}`} className="px-3 py-1.5 border border-[var(--border-default)] text-xs font-semibold hover:bg-[var(--bg-elevated)] whitespace-nowrap rounded-lg text-[var(--text-primary)] transition-all">Decline</button>
                </>
              )}
              {it.status === "accepted" && (
                <Link 
                  to={`/deals/${it.collab_id}`} 
                  className="px-3 py-1.5 bg-[var(--violet)]/10 hover:bg-[var(--violet)]/20 text-[var(--violet)] text-xs font-bold border border-[var(--violet)]/20 rounded-lg shadow-sm transition-all whitespace-nowrap"
                >
                  Track progress &rarr;
                </Link>
              )}
              {tab === "sent" && it.status === "accepted" && (
                <button 
                  onClick={() => setPayingCollab({ dealId: it.collab_id, creatorId: it.to_user_id, amount: it.proposed_amount || 0 })}
                  className="px-4 py-2 bg-[var(--violet)] hover:bg-[var(--violet-hover)] text-white text-xs font-bold rounded-lg shadow transition-opacity whitespace-nowrap uppercase tracking-wider"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Campaign Applications render */}
        {tab === "campaign_applications" && items.map((it, i) => (
          <div key={it.application_id || it.campaign_id || i} className="bg-[var(--bg-card)] shadow-sm border border-[var(--border-default)] rounded-2xl p-6 flex items-center justify-between gap-5 flex-wrap sm:flex-nowrap hover:border-[var(--violet)] transition-all animate-in fade-in duration-200">
            <div className="space-y-1 pl-1">
              <div className="font-display text-lg text-[var(--text-primary)] font-semibold">
                {user?.role === "brand" ? it.creator_name : it.brand_name}
              </div>
              <div className="text-xs text-[var(--violet)] font-semibold font-mono flex items-center gap-1">
                <span>Campaign:</span>
                <span className="underline">{it.campaign_title}</span>
              </div>
              {it.pitch && (
                <p className="text-sm text-[var(--text-secondary)] max-w-2xl bg-[var(--bg-elevated)] px-3 py-2 rounded-xl mt-2 border border-[var(--border-default)] leading-relaxed italic">
                  &ldquo;{it.pitch}&rdquo;
                </p>
              )}
              <div className="text-xs text-[var(--text-secondary)] font-semibold pt-2">
                Proposed Compensation: <span className="text-emerald-600 font-mono text-sm font-bold">₹{(it.proposed_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] pt-1 font-mono">{new Date(it.applied_at).toLocaleString()}</div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] px-2 py-1 rounded-full font-mono font-bold uppercase tracking-wider border ${
                it.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : 
                it.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : 
                "bg-red-500/10 text-red-500 border-red-500/25"
              }`}>
                {it.status}
              </span>
              
              {user?.role === "creator" && it.status === "accepted" && it.thread_id && (
                <Link
                  to={`/chat/${it.thread_id}`}
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
              )}
            </div>
          </div>
        ))}
      </div>

      {payingCollab && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="relative w-full max-w-lg">
             <button onClick={() => setPayingCollab(null)} className="absolute -top-10 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
               <X size={24} />
             </button>
             <PayNow dealId={payingCollab.dealId} creatorId={payingCollab.creatorId} grossAmount={payingCollab.amount} />
           </div>
         </div>
      )}
    </div>
  );
}
