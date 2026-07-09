const fs = require('fs');
let code = fs.readFileSync('backend/server.ts', 'utf8');

const regex = /let text = response\.text;\s*const match = text\.match\(\/\\\{\[\\\\s\\\\S\]\*\\\}\/\);\s*if \(match\) \{\s*return res\.json\(JSON\.parse\(match\[0\]\)\);\s*\} else \{\s*return res\.json\(\{ error: "Failed to parse JSON" \}\);\s*\}/g;

code = code.replace(/let text = response\.text;\s*const match = text\.match\(\/\\\{\[\\\\s\\\\S\]\*\\\}\/\);\s*if \(match\) \{\s*return res\.json\(JSON\.parse\(match\[0\]\)\);\s*\} else \{\s*return res\.json\(\{ error: "Failed to parse JSON" \}\);\s*\}/g,
`let text = response.text;
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
        }`
);
fs.writeFileSync('backend/server.ts', code);
