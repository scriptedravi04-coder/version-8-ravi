import React, { useState, useEffect } from 'react';
import { Settings, Wrench, RadioReceiver, Gift, Award } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function PlatformTools() {
  const [maintenanceCreator, setMaintenanceCreator] = useState(false);
  const [maintenanceBrand, setMaintenanceBrand] = useState(false);
  const [autoOffCreator, setAutoOffCreator] = useState('');
  const [autoOffBrand, setAutoOffBrand] = useState('');

  useEffect(() => {
    api.get("/system-status").then(({ data }) => {
       setMaintenanceCreator(data.maintenance_mode_creator);
       setMaintenanceBrand(data.maintenance_mode_brand);
    }).catch(console.error);
  }, []);

  const handleToggleMaintenance = async (type, currentVal, autoOffHours) => {
    const newVal = !currentVal;
    
    if (type === 'creator') setMaintenanceCreator(newVal);
    if (type === 'brand') setMaintenanceBrand(newVal);

    try {
       await api.post("/admin/maintenance", { 
          type, 
          maintenance: newVal,
          autoOffHours: newVal && autoOffHours ? Number(autoOffHours) : null
       });
       toast.success(`${type === 'creator' ? 'Creator' : 'Brand'} maintenance mode ${newVal ? 'enabled' : 'disabled'}`);
    } catch(err) {
       if (type === 'creator') setMaintenanceCreator(!newVal);
       if (type === 'brand') setMaintenanceBrand(!newVal);
       toast.error("Failed to update maintenance mode");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       
       {/* Maintenance Mode: Creators */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1"><Wrench size={18} className="text-amber-500"/> Creator Maintenance</h3>
                <p className="text-xs text-[var(--text-secondary)]">Disable access for creators during upgrades.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={maintenanceCreator} onChange={() => handleToggleMaintenance('creator', maintenanceCreator, autoOffCreator)} />
               <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-default)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
             </label>
          </div>
          {maintenanceCreator ? (
             <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 text-xs font-medium flex items-center justify-center">
                Creator maintenance is currently ACTIVE.
             </div>
          ) : (
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Auto-off timer (hours)</label>
                   <input type="number" placeholder="e.g. 5" value={autoOffCreator} onChange={(e) => setAutoOffCreator(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500" />
                </div>
             </div>
          )}
       </div>

       {/* Maintenance Mode: Brands */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1"><Wrench size={18} className="text-[#9D7CFF]"/> Brand Maintenance</h3>
                <p className="text-xs text-[var(--text-secondary)]">Disable access for brands during upgrades.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={maintenanceBrand} onChange={() => handleToggleMaintenance('brand', maintenanceBrand, autoOffBrand)} />
               <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-default)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9D7CFF]"></div>
             </label>
          </div>
          {maintenanceBrand ? (
             <div className="p-3 bg-[#9D7CFF]/10 border border-[#9D7CFF]/30 rounded-xl text-[#9D7CFF] text-xs font-medium flex items-center justify-center">
                Brand maintenance is currently ACTIVE.
             </div>
          ) : (
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Auto-off timer (hours)</label>
                   <input type="number" placeholder="e.g. 5" value={autoOffBrand} onChange={(e) => setAutoOffBrand(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:outline-none focus:border-[#9D7CFF]" />
                </div>
             </div>
          )}
       </div>

       {/* 7.4 Gift Subscription */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1"><Gift size={18} className="text-[#9D7CFF]"/> Gift inPass / Subscription</h3>
                <p className="text-xs text-[var(--text-secondary)]">Manually grant premium access for promotions or support.</p>
             </div>
          </div>
          <div className="space-y-4">
             <div>
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block mb-1">User Identifier (Email or Handle)</label>
                <input type="text" placeholder="user@example.com" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block mb-1">Duration</label>
                   <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      <option>1 Month</option>
                      <option>3 Months</option>
                      <option>1 Year</option>
                      <option>Lifetime (VIP)</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block mb-1">Action</label>
                   <button className="w-full py-2 bg-[#9D7CFF] hover:bg-[#8B6BE0] text-[var(--text-primary)] font-bold rounded-xl text-sm transition-colors">Grant Access</button>
                </div>
             </div>
          </div>
       </div>

       {/* 7.1 Gamification Settings */}
       <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1"><Award size={18} className="text-amber-400"/> Gamification Rules</h3>
                <p className="text-xs text-[var(--text-secondary)]">Adjust inPoints awarded for user actions.</p>
             </div>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg border border-foreground/5">
                <span className="text-sm">Profile Completion</span>
                <input type="number" defaultValue="500" className="w-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-center text-sm p-1 font-mono"/>
             </div>
             <div className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg border border-foreground/5">
                <span className="text-sm">Successful Collab (Creator)</span>
                <input type="number" defaultValue="1500" className="w-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-center text-sm p-1 font-mono"/>
             </div>
             <div className="flex items-center justify-between p-2 bg-[var(--bg-elevated)] rounded-lg border border-foreground/5">
                <span className="text-sm">Successful Referral</span>
                <input type="number" defaultValue="2000" className="w-20 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-center text-sm p-1 font-mono"/>
             </div>
             <button className="w-full mt-2 py-2 border border-[var(--border-default)] hover:bg-foreground/5 transition-colors rounded-xl text-sm font-semibold">Save Adjustments</button>
          </div>
       </div>

    </div>
  );
}
