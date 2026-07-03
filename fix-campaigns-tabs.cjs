const fs = require('fs');
let code = fs.readFileSync('src/pages/Campaigns.jsx', 'utf8');

// Add activeTab state
if (!code.includes('activeTab')) {
  code = code.replace(
    'const [appliedIds, setAppliedIds] = useState(new Set());',
    `const [appliedIds, setAppliedIds] = useState(new Set());\n  const [activeTab, setActiveTab] = useState("All Campaigns");`
  );
}

// Create tabs UI
const tabsHTML = `
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">Explore Opportunities</h1>
        <p className="text-muted-foreground">Discover and apply to top brand campaigns suited for your niche.</p>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 custom-scrollbar hide-scrollbar-arrows">
        {["All Campaigns", "UGC Campaigns", "Paid Campaigns", "Barter Campaigns", "Affiliate Campaigns", "Featured Brands", "Trending Opportunities"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm \${activeTab === tab ? 'bg-[var(--violet)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]'}\`}
          >
            {tab}
          </button>
        ))}
      </div>
`;

code = code.replace(
  /<div className="mb-10">\s*<h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">Live Campaigns<\/h1>\s*<p className="text-muted-foreground">Discover and apply to top brand campaigns suited for your niche\.<\/p>\s*<\/div>/,
  tabsHTML
);

// Add filtering by tab
const filteredMemo = code.indexOf('const filtered = useMemo(() => {');
const filteredMemoReturn = code.indexOf('return data.filter(c => {', filteredMemo);
code = code.replace(
  'return data.filter(c => {',
  `return data.filter(c => {
      if (activeTab === "UGC Campaigns" && c.category !== "UGC") return false;
      if (activeTab === "Paid Campaigns" && c.budget === 0) return false;
      if (activeTab === "Barter Campaigns" && c.budget > 0) return false;
      if (activeTab === "Trending Opportunities" && c.expiry_days > 5) return false;
      `
);

// We need to add `activeTab` to the dependency array
code = code.replace(
  '[data, search, catFilter, locFilter, platFilter, budgetRange]',
  '[data, search, catFilter, locFilter, platFilter, budgetRange, activeTab]'
);


fs.writeFileSync('src/pages/Campaigns.jsx', code);
