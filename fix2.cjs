const fs = require('fs');
const path = './src/pages/onboarding/CreatorOnboarding.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file has mismatched tags. Let's fix them.
// "Unexpected closing "div" tag does not match opening "section" tag" at line 93
content = content.replace(
  '        <div className="w-full max-w-sm relative z-10">\n          <LivePreviewCard />\n        </div>\n      </div>',
  '        <div className="w-full max-w-sm relative z-10">\n          <LivePreviewCard />\n        </div>\n      </section>'
);

// "Unexpected closing "section" tag does not match opening "div" tag" at line 136
content = content.replace(
  '         <h3 className="text-center text-[#565f89] font-bold text-xs uppercase mb-4 tracking-widest">Live Profile Preview</h3>\n         <LivePreviewCard />\n      </section>',
  '         <h3 className="text-center text-[#565f89] font-bold text-xs uppercase mb-4 tracking-widest">Live Profile Preview</h3>\n         <LivePreviewCard />\n      </section>'
);

fs.writeFileSync(path, content);
