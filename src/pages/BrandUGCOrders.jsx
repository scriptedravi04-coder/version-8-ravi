import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { Video, CheckCircle, Clock, PlayCircle, Star, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function BrandUGCOrders() {
  const [orders, setOrders] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const { startLoading, stopLoading } = useLoading();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/ugc/orders/brand");
      setOrders(res.data || []);
      const briefRes = await api.get("/ugc/briefs/my");
      setBriefs(briefRes.data.filter(b => b.status !== "COMPLETED") || []);
    } catch(e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    startLoading();
    await fetchOrders();
    stopLoading();
  };

  useEffect(() => {
    loadData();
    const intv = setInterval(fetchOrders, 30000);
    return () => clearInterval(intv);
  }, []);

  const getStageDetails = (status, order) => {
    if (status === 'QUALITY_REVIEW') return { stage: "Pending Review", statusColor: "text-orange-500", glow: "from-orange-500" };
    if (status === 'COMPLETED') return { stage: "Completed", statusColor: "text-green-500", glow: "from-green-500" };
    if (status === 'REVISION_REQUESTED') return { stage: "In Revision", statusColor: "text-purple-500", glow: "from-purple-500" };
    return { stage: "In Production", statusColor: "text-blue-500", glow: "from-blue-500" };
  };

  const handleApprove = async (orderId) => {
    toast.loading("Approving...", { id: "approve" });
    try {
      await api.post(`/ugc/orders/${orderId}/approve`);
      toast.success("Approved!", { id: "approve" });
      fetchOrders();
    } catch(e) {
      toast.error("Failed to approve", { id: "approve" });
    }
  };

  if (briefs.length === 0 && orders.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 w-full min-h-[calc(100vh-80px)] bg-[var(--bg-base)]">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4">Live Track</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-12">Monitor your active UGC briefs and orders.</p>
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--bg-card)]">
           <Video size={48} className="text-[var(--text-tertiary)] mb-4" />
           <p className="text-lg font-bold text-[var(--text-primary)] mb-2">No active orders or briefs yet.</p>
           <Link to="/brand/ugc/post" className="text-[var(--violet)] font-bold hover:underline">Create a Brief</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 w-full min-h-[calc(100vh-80px)] bg-[var(--bg-base)] overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative z-20">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4 flex items-center gap-4">
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--violet)] to-[#3B82F6]">Order Tracking</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
             Monitor your active creator partnerships in real-time. Review and approve submissions.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          <Link to="/brand/ugc/post" className="bg-[var(--violet)] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg transition-all hover:-translate-y-1">
             Post New Brief
          </Link>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, idx) => {
          const { stage, statusColor, glow } = getStageDetails(order.brand_status, order);
          const creatorName = order.creator?.name || order.creator?.username || "Creator";
          const delivery = order.latestDelivery;

          return (
             <div key={order.id} className="relative group bg-[var(--bg-card)] rounded-[2rem] overflow-hidden border border-[var(--border-default)] shadow-lg flex flex-col hover:-translate-y-1 transition-all duration-300">
                   <div className="bg-[var(--bg-card)] p-6 relative overflow-hidden flex-shrink-0 border-b border-[var(--border-default)]">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-elevated)] blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3B82F6]/20 border border-[#7c3aed]/30 flex items-center justify-center shrink-0 shadow-inner">
                           <Video size={20} className="text-[var(--text-primary)]/80" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mb-1.5 drop-shadow-sm">Amount</span>
                           <span className="text-base font-black text-[var(--text-primary)] bg-[var(--bg-elevated)] px-3 py-1 rounded-xl border border-[var(--border-default)] shadow-inner">₹{order.agreed_amount?.toLocaleString() || order.brief?.budget?.toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center gap-1.5 shadow-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`} />
                            {stage}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight line-clamp-1">{order.brief?.title || "UGC Order"}</h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium truncate">By {creatorName}</p>
                     </div>
                   </div>

                   <div className="p-6 bg-[var(--bg-elevated)] flex-1 flex flex-col relative z-10">
                     {delivery ? (
                       <div className="mb-4 bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border-default)]">
                         <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-2">
                           <PlayCircle size={16} className="text-[var(--violet)]"/> Delivered Video
                         </div>
                         <a href={delivery.video_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs truncate block font-mono">
                           {delivery.video_name || "video_file.mp4"}
                         </a>
                         {delivery.creator_notes && (
                           <p className="text-xs text-[var(--text-secondary)] mt-2 italic bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-strong)]">"{delivery.creator_notes}"</p>
                         )}
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center py-6 text-center text-[var(--text-tertiary)] bg-[var(--bg-base)] rounded-xl border border-dashed border-[var(--border-default)]">
                          <Clock size={24} className="mb-2 opacity-50" />
                          <p className="text-xs font-medium">Awaiting Submission</p>
                       </div>
                     )}

                     <div className="mt-auto pt-6 flex gap-3">
                       <Link to={`/chat/${order.creator_id}`} className="flex-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-primary)] font-bold py-3 rounded-xl transition-all border border-[var(--border-default)] text-xs flex items-center justify-center gap-2">
                         <MessageCircle size={14}/> Message
                       </Link>
                       {order.brand_status === 'QUALITY_REVIEW' && (
                         <button onClick={() => handleApprove(order.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-xs flex items-center justify-center gap-2">
                           <CheckCircle size={14}/> Approve
                         </button>
                       )}
                     </div>
                   </div>
             </div>
          );
        })}
        {orders.length === 0 && briefs.map(brief => (
          <div key={brief.id} className="relative group bg-[var(--bg-card)] rounded-[2rem] overflow-hidden border border-[var(--border-default)] shadow-lg flex flex-col hover:-translate-y-1 transition-all duration-300 opacity-70">
            <div className="bg-[var(--bg-card)] p-6 relative overflow-hidden flex-shrink-0 border-b border-[var(--border-default)]">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                     <Video size={20} className="text-[var(--text-tertiary)]" />
                  </div>
               </div>
               <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center gap-1.5 shadow-sm text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Sourcing Creators
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight line-clamp-1">{brief.title || "UGC Brief"}</h2>
               </div>
            </div>
            <div className="p-6 bg-[var(--bg-elevated)] flex-1 flex flex-col justify-center text-center">
               <p className="text-sm text-[var(--text-secondary)]">No orders placed yet.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
