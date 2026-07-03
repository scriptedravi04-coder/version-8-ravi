import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Users, CheckSquare, Square, ChevronDown } from 'lucide-react';
import CreatorKYCReview from './CreatorKYCReview';
import { api } from '../../lib/api';

const mockWaitlist = [
  { id: 1, name: "Aarushi Jain", photo: "https://i.pravatar.cc/150?u=a", date: "2026-06-19", handle: "@aarushi_j", followers: 125000, platform: "Instagram", position: 1, status: "Pending" },
  { id: 2, name: "Rahul Verma", photo: "https://i.pravatar.cc/150?u=r", date: "2026-06-18", handle: "@rahul_vlogs", followers: 89000, platform: "YouTube", position: 2, status: "Pending" },
  { id: 3, name: "Sneha Kapoor", photo: "https://i.pravatar.cc/150?u=s", date: "2026-06-18", handle: "@sneha_styles", followers: 45000, platform: "Instagram", position: 3, status: "Approved" },
  { id: 4, name: "Tech with Karan", photo: "https://i.pravatar.cc/150?u=t", date: "2026-06-17", handle: "@karan_tech", followers: 12000, platform: "YouTube", position: 4, status: "Rejected", rejectReason: "Fake followers" },
];

export default function WaitlistManager() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(null);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await api.get('/admin/waitlist');
      setWaitlist(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalWaitlisted = waitlist.filter(w => w.status === 'Pending').length;
  const approvedToday = waitlist.filter(w => w.status === 'Approved' && w.date.startsWith(new Date().toISOString().split('T')[0])).length || 0;
  const rejectedToday = waitlist.filter(w => w.status === 'Rejected' && w.date.startsWith(new Date().toISOString().split('T')[0])).length || 0;

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pendingIds = waitlist.filter(w => w.status === 'Pending').map(w => w.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/waitlist/${id}/approve`);
      setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: "Approved" } : w));
      setSelectedIds(prev => prev.filter(i => i !== id));
      setActiveCreatorIndex(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectAction = (e, id) => {
    e.stopPropagation();
    setRejectModalId(id);
  };

  const handleReject = async (id, reason) => {
    try {
      await api.post(`/admin/waitlist/${id}/reject`, { reason });
      setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: "Rejected", rejectReason: reason } : w));
      setRejectModalId(null);
      setRejectReason("");
      setSelectedIds(prev => prev.filter(i => i !== id));
      setActiveCreatorIndex(null);
    } catch (err) {
      console.error(err);
    }
  };

  const batchApprove = async () => {
    if (!selectedIds.length) return;
    try {
      await api.post('/admin/waitlist/batch-approve', { ids: selectedIds });
      setWaitlist(prev => prev.map(w => selectedIds.includes(w.id) ? { ...w, status: "Approved" } : w));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredWaitlist = waitlist.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.handle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "All" || w.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  if (activeCreatorIndex !== null) {
    const creator = waitlist.find(w => w.id === activeCreatorIndex);
    return (
      <CreatorKYCReview 
        creator={creator} 
        onBack={() => setActiveCreatorIndex(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-3xl font-display font-bold">{totalWaitlisted}</div>
              <div className="text-sm text-[var(--text-secondary)]">Total Pending Waitlist</div>
            </div>
         </div>
         <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-3xl font-display font-bold">{approvedToday}</div>
              <div className="text-sm text-[var(--text-secondary)]">Approved Today</div>
            </div>
         </div>
         <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <XCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-display font-bold">{rejectedToday}</div>
              <div className="text-sm text-[var(--text-secondary)]">Rejected Today</div>
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search creator..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl focus:border-[#9D7CFF] focus:outline-none text-sm"
            />
          </div>
          <div className="relative">
            <select 
              value={platformFilter} 
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl focus:border-[#9D7CFF] focus:outline-none text-sm"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" size={16} />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-primary)]/60">{selectedIds.length} selected</span>
            <button onClick={batchApprove} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg text-sm transition-colors">
              Approve Selected
            </button>
            <button onClick={() => setRejectModalId("batch")} className="px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-semibold transition-colors">
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-default)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">
                  <button onClick={toggleSelectAll} className="p-1 hover:text-[var(--text-primary)]">
                    {selectedIds.length > 0 && selectedIds.length === waitlist.filter(w=>w.status==='Pending').length ? <CheckSquare size={16}/> : <Square size={16}/>}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Platform & Following</th>
                <th className="px-4 py-3 font-medium">Signup Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-foreground/5">
              {filteredWaitlist.map(user => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-foreground/5 transition-colors group ${user.status === 'Pending' ? 'cursor-pointer' : ''}`}
                  onClick={() => user.status === 'Pending' && setActiveCreatorIndex(user.id)}
                >
                  <td className="px-4 py-4 truncate">
                    {user.status === 'Pending' ? (
                      <button onClick={(e) => toggleSelect(e, user.id)} className="p-1 hover:text-[var(--text-primary)] text-[var(--text-tertiary)]">
                        {selectedIds.includes(user.id) ? <CheckSquare size={16} className="text-[#9D7CFF]"/> : <Square size={16}/>}
                      </button>
                    ) : (
                      <div className="w-6"></div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-[var(--text-primary)]/60">#{user.position}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full border border-[var(--border-default)]" />
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{user.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[var(--text-primary)]/80">{user.platform}</span>
                       <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
                       <span className="font-semibold">{(user.followers / 1000).toFixed(1)}k</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-primary)]/60">{user.date}</td>
                  <td className="px-4 py-4">
                    {user.status === 'Pending' && <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-medium">Pending</span>}
                    {user.status === 'Approved' && <span className="px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-medium">Approved</span>}
                    {user.status === 'Rejected' && <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-medium">Rejected</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {user.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(user.id); }} className="px-3 py-1.5 bg-foreground/10 hover:bg-green-500 hover:text-black rounded-lg text-xs font-medium transition-colors">
                          Approve
                        </button>
                        <button onClick={(e) => handleRejectAction(e, user.id)} className="px-3 py-1.5 bg-foreground/5 hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 rounded-lg text-xs font-medium transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                    {user.status === 'Rejected' && (
                      <div className="text-xs text-[var(--text-tertiary)] max-w-[120px] truncate ml-auto" title={user.rejectReason}>
                        Reason: {user.rejectReason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredWaitlist.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-[var(--text-secondary)]">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[var(--border-default)]">
              <h3 className="font-display font-semibold text-xl">Reject Creator{rejectModalId === 'batch' ? 's' : ''}</h3>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Reason for rejection *</label>
              <div className="relative">
                <select 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl focus:border-red-500 focus:outline-none"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Incomplete profile">Incomplete profile</option>
                  <option value="Fake followers suspected">Fake followers suspected</option>
                  <option value="Duplicate account">Duplicate account</option>
                  <option value="Content against policy">Content against policy</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" size={16} />
              </div>
            </div>
            <div className="p-5 bg-[var(--bg-elevated)] flex gap-3 justify-end items-center">
              <button onClick={() => {setRejectModalId(null); setRejectReason("");}} className="px-4 py-2 text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] text-sm font-medium">Cancel</button>
              <button 
                disabled={!rejectReason}
                onClick={() => {
                  if (rejectModalId === 'batch') {
                     setWaitlist(prev => prev.map(w => selectedIds.includes(w.id) ? { ...w, status: "Rejected", rejectReason } : w));
                     setRejectModalId(null);
                     setRejectReason("");
                     setSelectedIds([]);
                  } else {
                     handleReject(rejectModalId, rejectReason);
                  }
                }} 
                className="px-4 py-2 bg-red-500 text-[var(--text-primary)] rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
