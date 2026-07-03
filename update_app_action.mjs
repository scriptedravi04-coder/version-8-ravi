import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      db.notifications.push({
        notif_id: \`notif_\${Math.random().toString(36).substring(2, 10)}\`,
        user_id: app.creator_user_id,
        type: "campaign_accepted",
        message: \`Your application for \${camp.title} was accepted!\`,
        read: false,
        created_at: getIsoNow(),
      });
      
      saveDb(db);
      return res.json({ ok: true });
    } else if (action === "decline") {`;

const newStr = `      db.notifications.push({
        notif_id: \`notif_\${Math.random().toString(36).substring(2, 10)}\`,
        user_id: app.creator_user_id,
        type: "campaign_accepted",
        message: \`Congratulations! The brand has accepted your application for \${camp.title}. Click to chat & finalize the deal.\`,
        read: false,
        created_at: getIsoNow(),
      });
      
      // Find the thread
      const thread = (db.chat_threads || []).find(t => t.campaign_id === req.params.campaign_id && t.creator_id === app.creator_user_id);
      
      saveDb(db);
      return res.json({ ok: true, thread_id: thread?.id });
    } else if (action === "decline") {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying action endpoint");
} else {
  console.log("Not found action endpoint target");
}
