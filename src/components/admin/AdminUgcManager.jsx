import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Upload, Camera, AlertTriangle } from "lucide-react";

export default function AdminUgcManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.get("/admin/ugc/orders").then(res => {
      setOrders(res.data);
      setLoading(false);
    }).catch(err => {
      // Mock since we didn't add the full admin GET route in server.ts
      setOrders([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTeamUpload = async (id) => {
    const videoUrl = prompt("Enter video URL (Simulating upload logic):", "https://example.com/team_video.mp4");
    if (!videoUrl) return;
    
    toast.loading("Uploading...", { id: "up" });
    try {
      await api.post(`/admin/ugc/orders/${id}/team-upload`, { video_url: videoUrl, thumbnail_url: "" });
      toast.success("Uploaded on behalf of creator", { id: "up" });
      loadData();
    } catch (err) {
      toast.error("Upload failed", { id: "up" });
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading UGC Orders...</div>;

  return (
    <div className="space-y-6">
       <div className="bg-[#16161e] rounded-3xl p-6 border border-[var(--border-default)]">
         <h2 className="text-xl font-bold mb-4">UGC Orders Management</h2>
         <p className="text-sm text-[var(--text-secondary)] mb-6">Track delayed delivery and upload via in-house team if creator misses deadline.</p>

         {orders.length === 0 ? (
           <div className="text-sm text-[var(--text-tertiary)] font-medium">Use Creator dashboard to generate orders in demo mode to test this feature.</div>
         ) : (
           <table className="w-full text-left text-sm">
             <thead className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest border-b border-[var(--border-default)]">
               <tr>
                 <th className="py-3">Order ID</th>
                 <th className="py-3">Status</th>
                 <th className="py-3">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="py-4 font-mono text-xs">{o.id}</td>
                    <td className="py-4">
                      {o.alert_22hr_sent ? <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">⚠️ At Risk</span> : <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">On Time</span>}
                    </td>
                    <td className="py-4">
                      <button onClick={() => handleTeamUpload(o.id)} className="bg-[#7c3aed] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-2">
                        <Upload size={12}/> Team Upload
                      </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
         )}
       </div>
    </div>
  );
}
