const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

const target = `let text = response.text;
        const match = text.match(/\\{[\\s\\S]*\\}/);
        if (match) {
          return res.json(JSON.parse(match[0]));
        } else {
          return res.json({ error: "Failed to parse JSON" });
        }`;

const replacement = `let text = response.text;
        try {
          const jsonStr = text.replace(/\\s*\`\`\`[a-z]*\\n?/gi, "").replace(/\\s*\`\`\`/g, "");
          const match = jsonStr.match(/\\{[\\s\\S]*\\}/);
          if (match) {
            return res.json(JSON.parse(match[0]));
          } else {
            return res.json({ error: "Failed to parse JSON" });
          }
        } catch(e) {
           return res.json({ error: "Failed to parse JSON" });
        }`;

code = code.split(target).join(replacement);
fs.writeFileSync('backend/server.ts', code);
