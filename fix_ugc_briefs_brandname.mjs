import fs from 'fs';
let code = fs.readFileSync('backend/server.ts', 'utf8');

const tStr = `    const brief = {
      id: \`brief_\${Math.random().toString(36).substring(2, 11)}\`,
      brand_id: user.user_id,
      ...req.body,`;

const newStr = `    const creatorUser = db.users.find(u => u.user_id === user.user_id);
    const profile = db.brand_profiles?.find(p => p.user_id === user.user_id) || creatorUser;
    
    const brief = {
      id: \`brief_\${Math.random().toString(36).substring(2, 11)}\`,
      brand_id: user.user_id,
      brand_name: profile?.company || profile?.name || "Brand Partner",
      ...req.body,`;

if (code.includes(tStr)) {
  code = code.replace(tStr, newStr);
  fs.writeFileSync('backend/server.ts', code);
  console.log("Success modifying /ugc/briefs");
} else {
  console.log("Could not find the tStr in backend/server.ts");
}
