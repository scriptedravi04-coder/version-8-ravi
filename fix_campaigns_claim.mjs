import fs from 'fs';
let code = fs.readFileSync('src/pages/Campaigns.jsx', 'utf8');

const targetStr = `      const { data } = await api.post("/ugc/orders/claim", { brief_id: selectedBrief.id });
      toast.success("Order Active! 22 hours remaining.", { id: 'claim' });
      navigate("/creator/ugc/orders");`;

const newStr = `      const { data } = await api.post("/ugc/orders/claim", { brief_id: selectedBrief.id });
      toast.success("Brief claimed successfully!", { id: 'claim' });
      if (data.thread_id) {
        navigate(\`/chat/\${data.thread_id}\`);
      } else {
        navigate("/creator/ugc/orders");
      }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/Campaigns.jsx', code);
  console.log("Success modifying Campaigns.jsx");
} else {
  console.log("Not found Campaigns.jsx target");
}
