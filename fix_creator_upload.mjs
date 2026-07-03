import fs from 'fs';
let code = fs.readFileSync('src/pages/CreatorUGCOrders.jsx', 'utf8');

const oldHandleSubmit = `  const handleSubmit = async () => {
    if(!submitModal) return;
    toast.loading("Uploading delivery...", { id: 'dev' });
    try {
      await api.post(\`/ugc/orders/\${submitModal}/deliver\`, { 
        video_url: "https://example.com/delivered_video.mp4",
        creator_notes: ""
      });
      toast.success("Delivered successfully! Brand will review within 24h.", { id: 'dev' });
      setSubmitModal(null);
      loadData();
    } catch(e) {
      toast.error("Failed to submit", { id: 'dev' });
    }
  };`;

const newHandleSubmit = `  const handleSubmit = async () => {
    if(!submitModal) return;
    toast.loading("Uploading delivery...", { id: 'dev' });
    try {
      await api.post(\`/ugc/orders/\${submitModal}/deliver\`, { 
        video_url: "https://example.com/delivered_video.mp4",
        video_name: file ? file.name : "Uploaded_Video.mp4",
        creator_notes: ""
      });
      toast.success("Delivered successfully! Brand will review within 24h.", { id: 'dev' });
      setSubmitModal(null);
      setFile(null);
      loadData();
    } catch(e) {
      toast.error("Failed to submit", { id: 'dev' });
    }
  };`;

if(code.includes(oldHandleSubmit)) {
  code = code.replace(oldHandleSubmit, newHandleSubmit);
  fs.writeFileSync('src/pages/CreatorUGCOrders.jsx', code);
  console.log("Success modifying CreatorUGCOrders upload");
} else {
  console.log("Not found CreatorUGCOrders upload");
}
