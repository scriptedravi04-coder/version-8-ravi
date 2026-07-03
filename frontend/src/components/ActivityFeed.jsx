import React from "react";
import { Link } from "react-router-dom";

export default function ActivityFeed({ activities = [] }) {
  const getDotColorClass = (status) => {
    switch (status) {
      case "approved":
      case "live":
        return "bg-[#10b981]"; // Emerald / Green
      case "pending":
      case "new":
        return "bg-[#f59e0b]"; // Amber / Yellow
      case "rejected":
        return "bg-[#ef4444]"; // Red
      case "in_progress":
        return "bg-[#3b82f6]"; // Blue
      default:
        return "bg-[#6b7280]"; // Gray
    }
  };

  return (
    <div className="bg-[#131224]/90 border border-white/5 p-6 rounded-xl shadow-sm text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
          <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Recent Activity
          </h3>
          <span className="text-[10px] font-mono font-medium text-[#9D7CFF] uppercase tracking-wider animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            Live Updates
          </span>
        </div>

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-sm text-white/30 text-center py-4">No recent activity</div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3.5 group py-1">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-lg ${getDotColorClass(act.status)}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/95 group-hover:text-white transition-colors leading-relaxed">
                    {act.message}
                  </p>
                  <span className="text-[10px] text-white/40 block mt-0.5">{act.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-5 border-t border-white/5 mt-6 flex justify-end">
        <Link 
          to="/brand/campaigns" 
          className="text-xs font-bold text-[#9D7CFF] hover:text-[#7C5CFF] transition-all flex items-center gap-1 hover:underline"
        >
          View All Activities
        </Link>
      </div>
    </div>
  );
}
