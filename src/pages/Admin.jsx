/* eslint-disable */
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Users, Megaphone, ShieldCheck, MessageCircle, Hand, Briefcase, Ban, Trash2, CheckCircle2, XCircle, Percent, AlertTriangle, Save, Eye, Banknote, Image as ImageIcon, Wrench, X } from "lucide-react";
import FeeConfigPanel from "../components/FeeConfigPanel";
import PendingApprovalsTable from "../components/PendingApprovalsTable";
import AdminChatDashboard from "../components/chat/AdminChatDashboard";
import WaitlistManager from "../components/admin/WaitlistManager";
import KYCManager from "../components/admin/KYCManager";

import UserEnforcementPanel from "../components/admin/UserEnforcementPanel";

import CampaignReviewQueue from "../components/admin/CampaignReviewQueue";

import BannerManager from "../components/admin/BannerManager";
import SystemReports from "../components/admin/SystemReports";
import EscrowDashboard from "../components/admin/EscrowDashboard";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import PlatformTools from "../components/admin/PlatformTools";
import AdminUgcManager from "../components/admin/AdminUgcManager";

const fmtINR = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

export default function Admin() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);
  const [escrowSubTab, setEscrowSubTab] = useState("ledger");
  const tab = searchParams.get("tab") || "dashboard";
  const [activeEnforcementUser, setActiveEnforcementUser] = useState(null);
  const [showAdminNotif, setShowAdminNotif] = useState(false);

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/campaigns").then(({ data }) => setCampaigns(data)).catch(() => {});
    api.get("/admin/verifications").then(({ data }) => setVerifications(data)).catch(() => {});
    api.get("/admin/reports").then(({ data }) => setReports(data)).catch(() => {});
    api.get("/admin/settings").then(({ data }) => setSettings(data)).catch(() => {});
  };

  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-primary)]/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace/>;
  if (user.role !== "admin") return <div className="max-w-2xl mx-auto px-6 py-20 text-center"><h1 className="font-display text-4xl">Access Denied</h1><p className="mt-3 text-[var(--text-primary)]/60">Admin role required.</p></div>;

  const ban = async (id, currentlyBanned) => {
    try { await api.post(`/admin/users/${id}/${currentlyBanned ? "unban" : "ban"}`); toast.success(currentlyBanned ? "Unbanned" : "Banned"); load(); } catch { toast.error("Failed"); }
  };
  const delCamp = async (id) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try { await api.delete(`/admin/campaigns/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };
  const decideVer = async (id, decision) => {
    try { await api.post(`/admin/verifications/${id}/${decision}`, { note: "" }); toast.success(decision === "approve" ? "Approved" : "Rejected"); load(); } catch { toast.error("Failed"); }
  };
  const resolveReport = async (id) => {
    try { await api.post(`/admin/reports/${id}/resolve`); toast.success("Resolved"); load(); } catch { toast.error("Failed"); }
  };

  const pendingVer = verifications.filter((v) => v.status === "pending").length;
  const openReports = reports.filter((r) => r.status === "open").length;

  const getHeaderTitle = () => {
    switch(tab) {
      case "dashboard": return "Platform Overview";
      case "users": return "Users & Creators";
      case "waitlist": return "Waitlist Manager";
      case "campaigns": return "Campaigns & Approvals";
      case "chat": return "Chat Moderation";
      case "verifications": return "KYC Checks";
      case "reports": return "System Reports & Disputes";
      case "escrow": return "Escrow & Payables Monitor";
      case "settings": return "Platform Settings & Controls";
      default: return "Admin Panel";
    }
  };

  return (
    <div className="w-full px-6 md:px-10 py-12" data-testid="admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#7C5CFF]/5 border border-[var(--violet)]/20 flex items-center justify-center">
             <ShieldCheck size={24} className="text-[var(--violet)]"/>
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--violet)] uppercase tracking-wider">Ybex Control • Admin</span>
            <h1 className="font-display text-4xl font-bold mt-0.5 tracking-tight">{getHeaderTitle()}</h1>
          </div>
        </div>

        {/* Administrative Action Center Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowAdminNotif(!showAdminNotif)}
            className="p-3 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--violet)]/20 rounded-full text-[var(--text-primary)]/60 hover:text-[var(--violet)] transition-all relative flex items-center justify-center"
            title="Moderator Notifications"
          >
            <Bell size={20} className={pendingVer + openReports > 0 ? "animate-bounce" : ""} />
            {pendingVer + openReports > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-[var(--text-primary)] text-[10px] font-black flex items-center justify-center -mt-1.5 -mr-1.5 border-2 border-background">
                {pendingVer + openReports}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showAdminNotif && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAdminNotif(false)}
                  className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 250 }}
                  className="fixed top-0 right-0 w-full max-w-sm sm:max-w-md h-full bg-[var(--bg-card)]  backdrop-blur-2xl border-l border-[var(--border-default)] shadow-2xl z-[250] flex flex-col overflow-hidden select-none text-left"
                >
                  <div className="flex items-center justify-between p-6 border-b border-foreground/5 bg-foreground/[0.02]">
                    <div className="flex items-center gap-2">
                       <Bell className="w-5 h-5 text-[var(--violet)]" />
                       <span className="font-bold text-lg tracking-wide text-[var(--text-primary)]">Moderator Notifications</span>
                    </div>
                    <button onClick={() => setShowAdminNotif(false)} className="p-2 hover:bg-foreground/5 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto w-full scrollbar-hidden p-4 space-y-4">
                  {pendingVer + openReports === 0 ? (
                    <div className="py-12 text-center text-sm text-[var(--text-primary)]/45 flex flex-col items-center gap-3">
                      <span className="text-3xl">🎉</span>
                      <span>No outstanding compliance reviews required. All quiet.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingVer > 0 && (
                        <button 
                          onClick={() => { setSearchParams({ tab: "verifications" }); setShowAdminNotif(false); }}
                          className="w-full p-2.5 bg-foreground/3 hover:bg-[var(--violet)]/10 border border-transparent hover:border-[var(--violet)]/20 rounded-xl flex items-start gap-3 text-left transition-all group"
                        >
                          <span className="p-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg shrink-0 text-xs">⚠️</span>
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--violet)] transition-colors">Pending KYC Review</h5>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{pendingVer} submission{pendingVer > 1 ? "s" : ""} awaiting identity and payment verification approval.</p>
                          </div>
                        </button>
                      )}
                      
                      {openReports > 0 && (
                        <button 
                          onClick={() => { setSearchParams({ tab: "reports" }); setShowAdminNotif(false); }}
                          className="w-full p-2.5 bg-foreground/3 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 rounded-xl flex items-start gap-3 text-left transition-all group"
                        >
                          <span className="p-2 bg-red-500/10 text-red-400 border border-red-500/25 rounded-lg shrink-0 text-xs">🚨</span>
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-red-400 transition-colors">System Abuse Reports</h5>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{openReports} flag{openReports > 1 ? 's' : ''} require critical moderation or account review.</p>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tab === "dashboard" && (
        <AdminAnalytics />
      )}

      {tab === "users" && (
        activeEnforcementUser ? (
           <UserEnforcementPanel 
              user={activeEnforcementUser} 
              onBack={() => setActiveEnforcementUser(null)} 
           />
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden" data-testid="users-table">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-[var(--border-default)] label-mini bg-foreground/3">
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            <div className="max-h-[600px] overflow-y-auto scroll-thin">
              {users.map((u) => (
                <div key={u.user_id} onClick={() => setActiveEnforcementUser(u)} className="grid grid-cols-12 px-5 py-3 border-b border-foreground/5 items-center hover:bg-foreground/5 cursor-pointer transition-colors group">
                  <div className="col-span-4 flex items-center gap-2.5">
                    {u.picture ? <img src={u.picture} alt="" className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center text-xs font-semibold">{(u.name || "?").charAt(0)}</div>}
                    <span className="text-sm font-medium truncate group-hover:text-[var(--violet)] transition-colors">{u.name}</span>
                    {u.banned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">BANNED</span>}
                  </div>
                  <div className="col-span-3 text-sm text-[var(--text-primary)]/60 truncate">{u.email}</div>
                  <div className="col-span-2 text-sm capitalize">{u.role || "—"}</div>
                  <div className="col-span-2 text-xs text-[var(--text-tertiary)]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                  <div className="col-span-1 flex justify-end">
                    {u.role !== "admin" && (
                      <button onClick={(e) => { e.stopPropagation(); ban(u.user_id, u.banned); }} data-testid={`ban-${u.user_id}`} className="p-1.5 rounded hover:bg-red-500/15 text-red-400 border border-transparent hover:border-red-500/30 transition-colors" title={u.banned ? "Unban" : "Ban"}><Ban size={15}/></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {tab === "waitlist" && (
        <WaitlistManager />
      )}

      {tab === "campaigns" && (
        <CampaignReviewQueue />
      )}

      {tab === "chat" && (
        <AdminChatDashboard />
      )}

      {tab === "verifications" && (
        <KYCManager />
      )}

      {tab === "reports" && (
        <SystemReports />
      )}

      {tab === "settings" && settings && (
        <div className="space-y-12">
          <div>
             <h2 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-4"><Wrench size={20} className="text-amber-500"/> System Utilities & Tools</h2>
             <PlatformTools />
          </div>
          <div>
             <h2 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-4"><Banknote size={20} className="text-[var(--violet)]"/> Income & Revenue Settings</h2>
             <FeeConfigPanel />
          </div>
          <div>
             <h2 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-4"><ImageIcon size={20} className="text-[var(--violet)]"/> Banner Management</h2>
             <BannerManager />
          </div>
        </div>
      )}

      {tab === "escrow" && (
         <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-[var(--border-default)] pb-4">
              <button 
                onClick={() => setEscrowSubTab("ledger")} 
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${escrowSubTab === "ledger" ? 'bg-foreground text-background' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] hover:bg-foreground/5'}`}
              >
                Global Ledger
              </button>
              <button 
                onClick={() => setEscrowSubTab("approvals")} 
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${escrowSubTab === "approvals" ? 'bg-amber-500 text-black' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] hover:bg-foreground/5'}`}
              >
                Pending Approvals <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-xs">0</span>
              </button>
            </div>
            
            {escrowSubTab === "ledger" ? (
              <EscrowDashboard />
            ) : (
              <div>
                 <PendingApprovalsTable />
              </div>
            )}
         </div>
      )}

      {tab === "ugc-orders" && (
         <AdminUgcManager />
      )}
    </div>
  );
}

function FeesPanel({ settings, onSaved }) {
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        brand_markup_pct: parseFloat(form.brand_markup_pct),
        creator_deduction_pct: parseFloat(form.creator_deduction_pct),
        agency_markup_pct: parseFloat(form.agency_markup_pct),
        agency_deduction_pct: parseFloat(form.agency_deduction_pct),
      };
      const { data } = await api.put("/admin/settings", payload);
      onSaved(data);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl" data-testid="admin-fees">
      <div className="flex items-center gap-2 mb-2">
        <Percent size={18} className="text-[var(--violet)]"/>
        <h2 className="font-display text-2xl tracking-tight">Platform Fee Controls</h2>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-6">These percentages apply instantly across the platform. They are hidden from users — brands see marked-up creator rates, creators see budgets net of deductions.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeeField label="Brand Markup" hint="Added to creator rates shown to brands" value={form.brand_markup_pct} onChange={(v) => set("brand_markup_pct", v)} testid="fee-brand-markup"/>
        <FeeField label="Creator Deduction" hint="Deducted from budgets/payouts shown to creators" value={form.creator_deduction_pct} onChange={(v) => set("creator_deduction_pct", v)} testid="fee-creator-deduction"/>
        <FeeField label="Agency Markup" hint="Added to creator rates shown to agencies" value={form.agency_markup_pct} onChange={(v) => set("agency_markup_pct", v)} testid="fee-agency-markup"/>
        <FeeField label="Agency Deduction" hint="Deducted from agency-side payouts" value={form.agency_deduction_pct} onChange={(v) => set("agency_deduction_pct", v)} testid="fee-agency-deduction"/>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)]">
        <div className="label-mini mb-2">Live Example — creator rate ₹10,000</div>
        <div className="grid grid-cols-2 gap-2">
          <div>Brand sees: <span className="text-[var(--text-primary)] font-semibold">{fmtINR(Math.round(10000 * (1 + (parseFloat(form.brand_markup_pct) || 0) / 100)))}</span></div>
          <div>Creator receives: <span className="text-[var(--text-primary)] font-semibold">{fmtINR(Math.round(10000 * (1 - (parseFloat(form.creator_deduction_pct) || 0) / 100)))}</span></div>
          <div>Agency sees: <span className="text-[var(--text-primary)] font-semibold">{fmtINR(Math.round(10000 * (1 + (parseFloat(form.agency_markup_pct) || 0) / 100)))}</span></div>
          <div>Platform margin: <span className="text-[var(--violet)] font-semibold">{((parseFloat(form.brand_markup_pct) || 0) + (parseFloat(form.creator_deduction_pct) || 0)).toFixed(1)}%</span></div>
        </div>
      </div>

      <button onClick={save} disabled={saving} data-testid="save-fees" className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--violet)] hover:bg-[#6B4FE0] text-[var(--text-primary)] font-semibold disabled:opacity-60">
        <Save size={16}/> {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

const FeeField = ({ label, hint, value, onChange, testid }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5">
    <label className="font-semibold text-sm">{label}</label>
    <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">{hint}</p>
    <div className="flex items-center gap-2">
      <input
        type="number" step="0.1" min="0" max="50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="w-full bg-[var(--bg-elevated)] border border-foreground/15 rounded-lg px-3 py-2 text-lg font-display focus:border-[#9D7CFF] outline-none"
      />
      <span className="text-[var(--text-tertiary)] font-display text-lg">%</span>
    </div>
  </div>
);

const SeverityPill = ({ severity }) => {
  const map = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-foreground/10 text-[var(--text-primary)]/60 border-foreground/20",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${map[severity] || map.low}`}>{severity}</span>;
};

const StatTile = ({ icon, label, value, accent }) => (
  <div className={`p-5 rounded-2xl border ${accent ? "bg-gradient-to-br from-[#7C5CFF]/15 to-transparent border-[var(--violet)]/20" : "bg-[var(--bg-card)] border-[var(--border-default)]"}`}>
    <div className="text-[var(--violet)]">{icon}</div>
    <div className="font-display text-3xl mt-2">{value}</div>
    <div className="text-xs text-[var(--text-secondary)] mt-1">{label}</div>
  </div>
);
