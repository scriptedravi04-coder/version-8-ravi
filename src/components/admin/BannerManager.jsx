import React, { useState, useEffect, useRef } from 'react';
import { Settings, Shield, Edit3, Image as ImageIcon, Link as LinkIcon, Search, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { CustomDatePicker } from '../ui/custom-date-picker';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function BannerManager() {
  const [tab, setTab] = useState('Influencer');
  const [banners, setBanners] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Influencer',
    placement: 'Dashboard Hero Carousel',
    link: '',
    status: 'Live'
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banners');
      setBanners(data || []);
    } catch (e) {
      console.warn("Failed to fetch banners", e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file && !formData.imgUrl) {
      toast.error("Please select an image");
      return;
    }
    
    // Enforce 3 banners max for Dashboard Hero Carousel per audience
    const existingCarouselBanners = banners.filter(b => b.placement === 'Dashboard Hero Carousel' && b.type === formData.type);
    if (formData.placement === 'Dashboard Hero Carousel' && existingCarouselBanners.length >= 3) {
      toast.error(`Maximum 3 carousel banners allowed for ${formData.type}s. Please delete an existing one first.`);
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('placement', formData.placement);
      submitData.append('link', formData.link);
      submitData.append('status', formData.status);
      if (file) {
        submitData.append('image', file);
      }

      await api.post('/banners', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Banner uploaded successfully!");
      setShowUploadModal(false);
      setFile(null);
      setPreview(null);
      setFormData({ type: tab, placement: 'Dashboard Hero Carousel', link: '', status: 'Live' });
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const filtered = banners.filter(b => b.type === tab);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-default)] w-full md:w-auto">
             {['Influencer', 'Brand'].map(t => (
                <button 
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setFormData(prev => ({...prev, type: t}));
                  }}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-[#9D7CFF] text-[var(--text-primary)] shadow-md' : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]'}`}
                >
                  {t} Banners
                </button>
             ))}
          </div>
          <button onClick={() => setShowUploadModal(true)} className="w-full md:w-auto px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors hover:bg-[var(--bg-elevated)]">
             <Plus size={16}/> Upload New Banner
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(b => (
             <div key={b.id} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden group relative">
                <div className="relative aspect-[3/1] bg-[var(--bg-elevated)]">
                   <img src={b.imgUrl} alt="Banner" className="w-full h-full object-cover" />
                   <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur border border-[var(--border-default)] rounded-md text-[10px] font-bold uppercase text-[var(--text-primary)] tracking-widest">
                      {b.placement}
                   </div>
                   {b.status === 'Live' && (
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                   )}
                </div>
                <div className="p-4 bg-[var(--bg-card)] flex items-center justify-between">
                   <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                         Status: <span className={b.status === 'Live' ? 'text-green-400' : 'text-amber-400'}>{b.status}</span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1 truncate max-w-[200px]" title={b.link}>
                        {b.link ? b.link : "No redirect link"}
                      </div>
                   </div>
                   <button onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 bg-red-400/10 rounded-lg"><Trash2 size={16}/></button>
                </div>
             </div>
          ))}
          {filtered.length === 0 && (
             <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-2xl">
                No active banners in this category.
             </div>
          )}
       </div>

       {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-[var(--bg-card)] border border-[var(--border-default)] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-[var(--border-default)] flex justify-between items-center">
                   <h3 className="font-display font-semibold text-lg flex items-center gap-2"><ImageIcon size={18}/> Upload Banner</h3>
                   <button onClick={() => setShowUploadModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20}/></button>
                </div>
                <div className="p-5 space-y-4">
                   <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                   
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative overflow-hidden"
                   >
                      {preview ? (
                        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <div className="text-sm font-semibold">Click to upload image</div>
                          <div className="text-xs mt-1">Size: 1200 x 400 pixels (3:1 aspect ratio)</div>
                        </>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Target Audience</label>
                         <select 
                           value={formData.type}
                           onChange={(e) => setFormData({...formData, type: e.target.value})}
                           className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]"
                         >
                            <option value="Influencer">Influencers</option>
                            <option value="Brand">Brands</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Placement</label>
                         <select 
                           value={formData.placement}
                           onChange={(e) => setFormData({...formData, placement: e.target.value})}
                           className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]"
                         >
                            <option value="Dashboard Hero Carousel">Dashboard Hero Carousel (Max 3)</option>
                            <option value="Sidebar">Sidebar</option>
                            <option value="Home Top Banner">Home Top Banner</option>
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Click-Through URL</label>
                      <div className="relative">
                         <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                         <input 
                           type="text" 
                           placeholder="https://..." 
                           value={formData.link}
                           onChange={(e) => setFormData({...formData, link: e.target.value})}
                           className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
                      <div>
                         <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Start Date</label>
                         <CustomDatePicker className="w-full bg-[var(--bg-elevated)] border-[var(--border-default)] px-3 py-2 h-auto" />
                      </div>
                      <div>
                         <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">End Date</label>
                         <CustomDatePicker className="w-full bg-[var(--bg-elevated)] border-[var(--border-default)] px-3 py-2 h-auto" />
                      </div>
                   </div>
                </div>
                <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-card)] flex justify-end gap-3">
                   <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]">Cancel</button>
                   <button 
                     onClick={handleUpload} 
                     disabled={loading}
                     className="px-5 py-2 bg-[#9D7CFF] hover:bg-[#8B6BE0] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                   >
                     {loading ? 'Uploading...' : 'Save & Publish'}
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
