import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const targetStr = `    const { video_url, thumbnail_url, creator_notes } = req.body;`;
const newStr = `    const { video_url, thumbnail_url, creator_notes, video_name } = req.body;`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  
  const targetSaveStr = `      creator_notes,
      submitted_by: 'creator',`;
  const newSaveStr = `      creator_notes,
      video_name,
      submitted_by: 'creator',`;
      
  code = code.replace(targetSaveStr, newSaveStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying backend /ugc/orders/:id/deliver");
} else {
  console.log("Not found in backend");
}

