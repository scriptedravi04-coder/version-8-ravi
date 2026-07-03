import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      // Create a messaging/chat thread
      db.chat_threads = db.chat_threads || [];
      const threadId = \`thread_\${Math.random().toString(36).substring(2, 10)}\`;
      db.chat_threads.push({
        id: threadId,
        campaign_id: camp.campaign_id,
        creator_id: app.creator_user_id,
        brand_id: actingBrandId,
        status: "ACCEPTED",
        created_at: getIsoNow(),
        updated_at: getIsoNow()
      });
      // Welcome chat message initializer
      db.chat_messages = db.chat_messages || [];
      db.chat_messages.push({
        id: \`msg_\${Math.random().toString(36).substring(2, 10)}\`, // Align with the schema id or message_id
        message_id: \`msg_\${Math.random().toString(36).substring(2, 10)}\`,
        thread_id: threadId,
        sender_id: actingBrandId,
        sender_role: "brand",
        content: \`Hi \${app.creator_name || "Creator"}! I have accepted your proposal for our campaign: '\${camp.title}'. Let me know how we should proceed.\`,
        created_at: getIsoNow()
      });
      
      saveDb(db);
      return res.json({ ok: true });`;

const newStr = `      // Find or Create thread
      db.chat_threads = db.chat_threads || [];
      let thread = db.chat_threads.find(t => t.campaign_id === camp.campaign_id && t.creator_id === app.creator_user_id);
      let threadId;
      if (thread) {
        threadId = thread.id;
        thread.status = "ACCEPTED";
      } else {
        threadId = \`thread_\${Math.random().toString(36).substring(2, 10)}\`;
        thread = {
          id: threadId,
          campaign_id: camp.campaign_id,
          creator_id: app.creator_user_id,
          brand_id: actingBrandId,
          status: "ACCEPTED",
          flow_state: "APPROVED",
          created_at: getIsoNow(),
          updated_at: getIsoNow()
        };
        db.chat_threads.push(thread);
      }

      saveDb(db);
      return res.json({ ok: true, thread_id: threadId });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success replacing thread logic in action endpoint");
} else {
  console.log("Target not found");
}
