import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

// Remove chat thread creation from /campaigns/apply
const oldApplyEnd = `    // Auto-create chat thread and a welcoming starting message
    db.chat_threads = db.chat_threads || [];
    let thread = db.chat_threads.find((t: any) => t.campaign_id === campaign_id && t.creator_id === user.user_id);
    if (!thread) {
      const threadId = \`thread_\${Math.random().toString(36).substring(2, 10)}\`;
      thread = {
        id: threadId,
        campaign_id: campaign_id,
        creator_id: user.user_id,
        brand_id: camp.brand_user_id,
        status: "NEGOTIATING",
        created_at: getIsoNow(),
        updated_at: getIsoNow(),
        
        // Add contract details for the workflow
        creator_name: creator_name || user.name,
        creator_location: creator_location || "Mumbai, Maharashtra",
        due_date: due_date || "2026-07-25",
        amount_fixed: Number(proposed_amount) || 25000,
        terms_and_conditions: terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.",
        campaign_title: camp.title,
        brand_name: camp.brand_name,
        flow_state: "REQUESTED", // REQUESTED -> APPROVED -> AI_AGREEMENT_READY -> COMPLETED
        brand_accepted: false,
        creator_accepted: false
      };
      db.chat_threads.push(thread);

      db.chat_messages = db.chat_messages || [];
      db.chat_messages.push({
        id: \`msg_\${Math.random().toString(36).substring(2, 10)}\`,
        thread_id: threadId,
        sender_id: user.user_id,
        sender_role: "creator",
        message_type: 'text',
        content: \`Application Submitted: \${pitch}\`,
        created_at: getIsoNow()
      });
      
      thread.due_date = due_date || "2026-07-25";
      thread.amount_fixed = Number(proposed_amount) || 25000;
      thread.terms_and_conditions = terms_and_conditions || "Deliver 1 high-quality Instagram Reel and 1 Story promoting the campaign. Ensure clear visuals and tag the brand account.";
      thread.flow_state = "REQUESTED";
    }

    await sendNotification(db, camp.brand_user_id, "NEW_APPLICATION", \`\${user.name} has applied to '\${camp.title}'.\`);

    saveDb(db);
    res.json({ message: "Applied successfully", application_id, thread_id: thread.id });
  });`;

const newApplyEnd = `    await sendNotification(db, camp.brand_user_id, "NEW_APPLICATION", \`\${user.name} has applied to '\${camp.title}'.\`);

    saveDb(db);
    res.json({ message: "Applied successfully", application_id });
  });`;

code = code.replace(oldApplyEnd, newApplyEnd);

// Modify /action === "accept" to create the correct thread
const oldAcceptChat = `      // Create a messaging/chat thread
      db.chat_threads = db.chat_threads || [];
      const threadId = \`thread_\${Math.random().toString(36).substring(2, 10)}\`;
      db.chat_threads.push({
        id: threadId,
        campaign_id: camp.campaign_id,
        creator_id: app.creator_user_id,
        brand_id: actingBrandId,
        status: "active",
        created_at: getIsoNow(),
        updated_at: getIsoNow()
      });
      
      db.chat_messages = db.chat_messages || [];
      db.chat_messages.push({
        id: \`msg_\${Math.random().toString(36).substring(2, 10)}\`,
        thread_id: threadId,
        sender_id: "system",
        sender_role: "system",
        message_type: "system",
        content: \`Application Approved. Begin discussing details.\`,
        created_at: getIsoNow()
      });`;

const newAcceptChat = `      // Create a messaging/chat thread
      db.chat_threads = db.chat_threads || [];
      const threadId = \`thread_\${Math.random().toString(36).substring(2, 10)}\`;
      db.chat_threads.push({
        id: threadId,
        campaign_id: camp.campaign_id,
        creator_id: app.creator_user_id,
        brand_id: actingBrandId,
        status: "NEGOTIATING",
        created_at: getIsoNow(),
        updated_at: getIsoNow(),
        flow_state: "NEGOTIATING",
        brand_name: camp.brand_name || user.name,
        campaign_title: camp.title
      });
      
      db.chat_messages = db.chat_messages || [];
      db.chat_messages.push({
        id: \`msg_\${Math.random().toString(36).substring(2, 10)}\`,
        thread_id: threadId,
        sender_id: "system",
        sender_role: "system",
        message_type: "system",
        content: \`Application Approved. Begin discussing details.\`,
        created_at: getIsoNow()
      });`;

code = code.replace(oldAcceptChat, newAcceptChat);

fs.writeFileSync('backend/server.ts', code);
console.log("Success modifying backend for chat creation on approval.");
