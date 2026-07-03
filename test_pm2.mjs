import { execSync } from "child_process";
console.log(execSync("npx -y pm2 list").toString());
