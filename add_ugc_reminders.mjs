import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      // CRON 2: 22hr alert
      const atRisk = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && !o.alert_22hr_sent && new Date(o.internal_deadline) < new Date(new Date(now).getTime() + 30 * 60 * 1000));`;

const newStr = `      // Reminders to Creator: 12h, 6h, 1h
      const toRemind = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && new Date(o.internal_deadline) > new Date(now));
      for (const order of toRemind) {
        const timeLeft = new Date(order.internal_deadline).getTime() - new Date(now).getTime();
        const brief = (db.ugc_briefs || []).find(b => b.id === order.brief_id);
        if (timeLeft <= 12 * 3600 * 1000 && !order.alert_12hr) {
          order.alert_12hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', \`Reminder: 12 hours left to submit the UGC video for "\${brief?.title || 'Brand'}". Please upload soon!\`).catch(() => {});
        } else if (timeLeft <= 6 * 3600 * 1000 && !order.alert_6hr) {
          order.alert_6hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', \`Urgent: Only 6 hours left to submit your UGC video for "\${brief?.title || 'Brand'}".\`).catch(() => {});
        } else if (timeLeft <= 1 * 3600 * 1000 && !order.alert_1hr) {
          order.alert_1hr = true;
          changed = true;
          sendNotification(db, order.creator_id, 'UGC_REMINDER', \`CRITICAL: Less than 1 hour left to submit your UGC video! Avoid cancellation.\`).catch(() => {});
        }
      }

      // CRON 2: 22hr alert
      const atRisk = (db.ugc_orders || []).filter(o => o.creator_status === 'CLAIMED' && !o.alert_22hr_sent && new Date(o.internal_deadline) < new Date(new Date(now).getTime() + 30 * 60 * 1000));`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success adding UGC reminders");
} else {
  console.log("Not found UGC reminders target");
}
