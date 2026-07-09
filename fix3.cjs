const fs = require('fs');
const path = './src/pages/onboarding/CreatorOnboarding.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix closing of right panel
content = content.replace(
  '          </AnimatePresence>\n        </div>\n      </div>            \n      {/* Mobile Live Preview Toggle or Stack */}\n      <div className="w-full sm:hidden p-6 bg-[#24283b] border-t border-[#565f89]/30 order-3">',
  '          </AnimatePresence>\n        </div>\n      </section>            \n      {/* Mobile Live Preview Toggle or Stack */}\n      <section className="w-full sm:hidden p-6 bg-[#24283b] border-t border-[#565f89]/30 order-3">'
);

fs.writeFileSync(path, content);
