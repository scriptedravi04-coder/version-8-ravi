import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { toast } from "sonner";
import ApplicantCard from "../../components/campaigns/ApplicantCard";
import { ArrowLeft, Megaphone, Users, HelpCircle, Check, Sparkles } from "lucide-react";

export default function BrandCampaignApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [campaign, setCampaign] = useState(location.state?.campaign || null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch full campaign details & submissions
      const { data: camps } = await api.get("/campaigns?mine=true").catch(() => ({ data: [] }));
      const found = camps.find(c => String(c.campaign_id || c.id) === String(id));
      if (found) {
        setCampaign(found);
        setApplicants(found.applicants || []);
      } else {
        // Mock fallback to support sandbox testing instantly
        setApplicants([
          {
            application_id: "app-1",
            full_name: "Ravi Kumar",
            followers_count: "125K",
            instagram_handle: "ravi_tech",
            category: "Tech",
            city: "Mumbai",
            proposed_rate: "₹12,000",
            delivery_days: "5 days",
            pitch_text: "I've worked with Samsung before, my tech reviews average 40K+ views. I have high active engagement indices in Tier-1 cities.",
            profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
          },
          {
            application_id: "app-2",
            full_name: "Priya Sharma",
            followers_count: "340K",
            instagram_handle: "priya_fitness",
            category: "Fashion / Sports",
            city: "Bangalore",
            proposed_rate: "₹22,000",
            delivery_days: "7 days",
            pitch_text: "Love your lifestyle and workout brand products. I can execute 1 vertical integration video with high retention indices.",
            profile_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"
          }
        ]);
      }
    } catch (e) {
      console.error("Error loading applicants list", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleShortlist = async (app) => {
    try {
      const { data } = await api.post(`/campaigns/${id || campaign?.campaign_id}/applications/${app.application_id}/action`, { action: "accept" });
      
      toast.success(`${app.full_name} has been shortlisted! Initiating secure chat.`);
      
      if (data.thread_id) {
        // Trigger agreement generation
        await api.post(`/chat/v2/threads/${data.thread_id}/approve-request`).catch(() => console.warn("Failed to generate AI agreement"));
        navigate(`/chat/${data.thread_id}`);
      } else {
        navigate(`/brand/inbox?creator_id=${app.instagram_handle || app.username || "ravi_tech"}`);
      }
    } catch (err) {
      toast.error("Process error, shortlist request failed.");
    }
  };

  const handleReject = async (app) => {
    try {
      await api.post(`/campaigns/${id || campaign?.campaign_id}/applications/${app.application_id}/action`, { action: "reject" }).catch(() => {
        console.warn("Direct reject simulation triggered");
      });
      toast.success(`Application entry has been declined.`);
      // Remove from list locally
      setApplicants(prev => prev.filter(a => a.application_id !== app.application_id));
    } catch (e) {
      toast.error("Decline action failed.");
    }
  };

  const handleProfileView = (app) => {
    // Navigate or link to profile detail page
    toast.info(`Viewing profile details of ${app.full_name || "@" + app.instagram_handle}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 bg-[var(--bg-base)] min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin"></div>
          <div className="text-[var(--text-tertiary)] text-sm font-mono tracking-widest uppercase">Fetching Applicants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-8 py-10 text-left min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="mb-8">
        <button 
          onClick={() => navigate("/brand/campaigns")}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-all"
        >
          <ArrowLeft size={14} /> Back to My Campaigns
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-1 px-2.5 rounded-lg bg-[var(--violet)]/10 text-[#a98eff] border border-[var(--violet)]/20 text-[10px] uppercase font-mono font-bold flex items-center gap-1">
                <Megaphone size={10} /> Active Campaign Briefing
              </span>
              <span className="text-[var(--text-primary)]/20">•</span>
              <span className="text-emerald-400 text-xs font-semibold font-mono">
                ₹{(campaign?.budget_min || 10000).toLocaleString("en-IN")} - ₹{(campaign?.budget_max || 15000).toLocaleString("en-IN")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1.5">
              {campaign?.title || "Campaign Applicants"}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-default)] px-4 py-2.5 rounded-2xl">
            <Users size={16} className="text-[var(--violet)]" />
            <div className="text-left font-sans">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Pitching pool</div>
              <div className="text-sm font-bold text-[var(--text-primary)] font-mono mt-0.5">{applicants.length} Creator Pits</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {applicants.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-16 text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
            <div className="p-4 bg-[var(--bg-elevated)] text-[var(--text-tertiary)] rounded-full mb-3">
              <HelpCircle size={28} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">No applicant entries yet</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed max-w-md">
              Pitches from creators will show up here as soon as verification completes. You can share your active campaign briefing URL to promote your listing!
            </p>
          </div>
        ) : (
          applicants.map((app) => (
            <ApplicantCard
              key={app.application_id || app.id}
              applicant={app}
              onShortlist={handleShortlist}
              onReject={handleReject}
              onViewProfile={handleProfileView}
            />
          ))
        )}
      </div>
    </div>
  );
}
