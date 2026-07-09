const fs = require('fs');
let code = fs.readFileSync('src/components/admin/BannerManager.jsx', 'utf8');

// Add "Common" tab
code = code.replace(/\{(\['Influencer', 'Brand'\])\.map/g, "{['Common', 'Influencer', 'Brand'].map");

// Add "Common" to select dropdowns
code = code.replace(/<option value="Influencer">Influencers<\/option>\s*<option value="Brand">Brands<\/option>/,
`<option value="Common">Common (New Users)</option>
                            <option value="Influencer">Influencers</option>
                            <option value="Brand">Brands</option>`);

// Update max carousel limits to 5
code = code.replace(/existingCarouselBanners\.length >= 3/g, "existingCarouselBanners.length >= 5");
code = code.replace(/Maximum 3 carousel banners allowed/g, "Maximum 5 carousel banners allowed");
code = code.replace(/Dashboard Hero Carousel \(Max 3\)/g, "Dashboard Hero Carousel (Max 5)");

fs.writeFileSync('src/components/admin/BannerManager.jsx', code);
