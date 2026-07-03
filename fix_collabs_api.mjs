import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `      const appCopy = { ...app };
      appCopy.campaign_title = camp.title;
      appCopy.brand_name = camp.brand_name;
      appCopy.campaign_id = camp.campaign_id;
      return appCopy;
    });`;

const newStr = `      const appCopy = { ...app };
      appCopy.campaign_title = camp.title;
      appCopy.brand_name = camp.brand_name;
      appCopy.campaign_id = camp.campaign_id;
      const thread = (db.chat_threads || []).find(t => t.campaign_id === camp.campaign_id && t.creator_id === app.creator_user_id);
      if (thread) {
        appCopy.thread_id = thread.id;
      }
      return appCopy;
    });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
