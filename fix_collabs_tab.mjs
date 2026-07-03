import fs from 'fs';
let code = fs.readFileSync('src/pages/Collabs.jsx', 'utf8');

const targetStr = `  const [tab, setTab] = useState("campaign_applications");`;

const newStr = `  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get("tab") || "campaign_applications";
  const [tab, setTab] = useState(initialTab);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/Collabs.jsx', code);
  console.log("Success modifying Collabs tab selection");
} else {
  console.log("Not found Collabs target string");
}
