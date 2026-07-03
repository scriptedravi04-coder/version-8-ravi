import fs from 'fs';
let code = fs.readFileSync('src/pages/BrandUGCOrders.jsx', 'utf8');

// Modify the fetch to get orders too
const oldState = `const [briefs, setBriefs] = useState([]);`;
const newState = `const [briefs, setBriefs] = useState([]);
  const [orders, setOrders] = useState([]);`;

code = code.replace(oldState, newState);

const oldFetch = `  const fetchBriefs = async () => {
    try {
      const res = await api.get("/ugc/briefs/my");
      setBriefs(res.data.filter(b => b.status !== "COMPLETED"));
    } catch(e) {
      console.error(e);
    }
  };`;

const newFetch = `  const fetchBriefs = async () => {
    try {
      const res = await api.get("/ugc/briefs/my");
      setBriefs(res.data.filter(b => b.status !== "COMPLETED"));
      const ordRes = await api.get("/ugc/orders/brand");
      setOrders(ordRes.data || []);
    } catch(e) {
      console.error(e);
    }
  };`;

code = code.replace(oldFetch, newFetch);

const oldMap = `{briefs.map(brief => {
          const { stage, progress, statusColor, glow } = getStageDetails(brief.created_at);`;

const newMap = `{briefs.map(brief => {
          const order = orders.find(o => o.brief_id === brief.id);
          let { stage, progress, statusColor, glow } = getStageDetails(brief.created_at);
          
          if (order) {
            if (order.brand_status === 'QUALITY_REVIEW') {
               stage = "🔍 Under Quality Review";
               progress = 95;
               statusColor = "text-indigo-500";
               glow = "from-indigo-500";
            } else if (order.brand_status === 'COMPLETED') {
               stage = "✅ Delivered!";
               progress = 100;
               statusColor = "text-green-500";
               glow = "from-green-500";
            }
          }`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/pages/BrandUGCOrders.jsx', code);
console.log("Success modifying BrandUGCOrders");
