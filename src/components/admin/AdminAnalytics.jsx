import React, { useState, useEffect } from 'react';
import { Target, Users, Megaphone, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Percent, ThumbsUp, CreditCard, Link as LinkIcon, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../../lib/api';

const revData = [
  { name: 'Mon', gmv: 4000, fee: 240 },
  { name: 'Tue', gmv: 3000, fee: 139 },
  { name: 'Wed', gmv: 2000, fee: 980 },
  { name: 'Thu', gmv: 2780, fee: 390 },
  { name: 'Fri', gmv: 1890, fee: 480 },
  { name: 'Sat', gmv: 2390, fee: 380 },
  { name: 'Sun', gmv: 3490, fee: 430 },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
     creators: 14209,
     brands: 3120,
     campaigns: 1240,
     live_campaigns: 230,
     collabs: 512
  });

  useEffect(() => {
     api.get("/admin/stats").then(r => r.data).then(data => {
        if(data && typeof data.creators !== 'undefined') {
           setStats(prev => ({...prev, ...data}));
        }
     }).catch(console.error);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
  };

  const totalUsers = stats.creators + stats.brands || 1;
  const creatorPct = Math.round((stats.creators / totalUsers) * 100);
  const brandPct = 100 - creatorPct;

  return (
    <div className="space-y-6">
       {/* 8.1 Revenue Analytics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total GMV" value="₹12.4M" desc="+15% this month" icon={<DollarSign size={20}/>} trend="up" />
          <StatCard title="Platform Fees" value="₹480K" desc="+8% this month" icon={<Activity size={20}/>} trend="up" />
          <StatCard title="Net Revenue" value="₹390K" desc="After costs & gateway" icon={<Target size={20}/>} trend="up" />
          <StatCard title="Total GST" value="₹86K" desc="Collected liability" icon={<Percent size={20}/>} trend="neutral" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Revenue Trend (30 Days)</h3>
                <select className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-xs focus:outline-none">
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                   <option>Year to Date</option>
                </select>
             </div>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
                 <AreaChart data={revData}>
                   <defs>
                     <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#9D7CFF" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#9D7CFF" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                   <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} width={40} />
                   <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#ffffff20', borderRadius: '12px' }} />
                   <Area type="monotone" dataKey="gmv" stroke="#9D7CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorGmv)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="space-y-6">
             {/* 8.2 User Count Overview */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--text-secondary)]">User Distribution</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Users size={16} className="text-blue-400"/> Creators</div>
                      <div className="font-bold text-lg">{formatNumber(stats.creators)}</div>
                   </div>
                   <div className="w-full bg-foreground/5 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${creatorPct}%`}}></div></div>
                   
                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2"><Briefcase size={16} className="text-amber-400"/> Brands</div>
                      <div className="font-bold text-lg">{formatNumber(stats.brands)}</div>
                   </div>
                   <div className="w-full bg-foreground/5 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{width: `${brandPct}%`}}></div></div>
                </div>
             </div>

             {/* 8.3 Referral Analytics Summary */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2"><LinkIcon size={16}/> Referral Program</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <div className="text-2xl font-bold">12.5%</div>
                      <div className="text-xs text-[var(--text-secondary)] leading-tight">Conversion Rate</div>
                   </div>
                   <div>
                      <div className="text-2xl font-bold text-green-400">₹84K</div>
                      <div className="text-xs text-[var(--text-secondary)] leading-tight">Paid in Commission</div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* 8.4 Campaign Stats */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Megaphone size={20} className="text-[#9D7CFF]"/> Campaign Lifecycle Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <PipelineBox label="Created" value={formatNumber(stats.campaigns)} sub="All time" />
             <PipelineBox label="In Review" value="4" sub="Pending admin" active />
             <PipelineBox label="Live" value={formatNumber(stats.live_campaigns)} sub="Accepting apps" />
             <PipelineBox label="In Progress" value={formatNumber(stats.collabs)} sub="Active collabs" />
             <PipelineBox label="Completed" value="890" sub="Resolved" success />
          </div>
       </div>
    </div>
  );
}

function StatCard({ title, value, desc, icon, trend }) {
   return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-foreground/30 transition-colors">
         <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-[var(--text-primary)]/60 mb-4">{icon}</div>
         <div className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</div>
         <div className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">{value}</div>
         <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[var(--text-tertiary)]'}`}>
            {trend === 'up' ? <ArrowUpRight size={14}/> : trend === 'down' ? <ArrowDownRight size={14}/> : null}
            {desc}
         </div>
      </div>
   );
}

function PipelineBox({ label, value, sub, active, success }) {
   return (
      <div className={`p-4 rounded-xl border ${active ? 'bg-[#9D7CFF]/10 border-[#9D7CFF]/50' : success ? 'bg-green-500/10 border-green-500/30' : 'bg-[var(--bg-elevated)] border-[var(--border-default)]'}`}>
         <div className="text-2xl font-bold mb-1">{value}</div>
         <div className={`text-sm font-semibold ${active ? 'text-[#9D7CFF]' : success ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>{label}</div>
         <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-2">{sub}</div>
      </div>
   );
}
