import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `  router.get("/ugc/orders/brand", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const orders = (db.ugc_orders || []).filter(o => o.brand_id === user.user_id).map(o => {
      // populate brief
      const brief = (db.ugc_briefs || []).find(b => b.id === o.brief_id);
      return { ...o, brief };
    });
    res.json(orders);
  });`;

const newStr = `  router.get("/ugc/orders/brand", (req, res) => {
    const user = parseAuthUser(req);
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    const db = getDb();
    const orders = (db.ugc_orders || []).filter(o => o.brand_id === user.user_id).map(o => {
      // populate brief
      const brief = (db.ugc_briefs || []).find(b => b.id === o.brief_id);
      // populate deliveries
      const deliveries = (db.ugc_deliveries || []).filter(d => d.order_id === o.id);
      const latestDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;
      // populate creator
      const creator = (db.creator_profiles || []).find(c => c.user_id === o.creator_id) || (db.users || []).find(u => u.user_id === o.creator_id);
      return { ...o, brief, latestDelivery, creator };
    });
    res.json(orders);
  });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying /ugc/orders/brand");
} else {
  console.log("Not found target string in backend");
}

