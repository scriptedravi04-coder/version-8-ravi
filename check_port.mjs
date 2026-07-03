import { execSync } from 'child_process';
try {
  console.log(execSync('netstat -tulnp | grep 3000').toString());
} catch (e) {
  try {
    console.log(execSync('ss -lptn \'sport = :3000\'').toString());
  } catch (e) {
    console.log('Failed:', e.message);
  }
}
