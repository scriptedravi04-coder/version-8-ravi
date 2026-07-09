const fs = require('fs');
const path = './src/pages/onboarding/CreatorOnboarding.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '        </div>\n      </div>\n      {/* Right Panel: Form Wizard */}\n      <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto order-1 lg:order-2">',
  '        </div>\n      </section>\n      {/* Right Panel: Form Wizard */}\n      <section className="lg:col-span-5 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-24 overflow-y-auto order-1 lg:order-2 min-h-screen">'
);

content = content.replace(
  '          </AnimatePresence>\n        </div>\n      </div>            \n      {/* Mobile Live Preview Toggle or Stack */}\n      <div className="w-full sm:hidden p-6 bg-[#24283b] border-t border-[#565f89]/30 order-3">',
  '          </AnimatePresence>\n        </div>\n      </section>            \n      {/* Mobile Live Preview Toggle or Stack */}\n      <section className="w-full lg:hidden p-6 bg-[#24283b] border-t border-[#565f89]/30 order-3">'
);

fs.writeFileSync(path, content);
