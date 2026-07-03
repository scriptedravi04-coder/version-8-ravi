import { execSync } from 'child_process';
try {
  execSync('npm run dev & sleep 3', { stdio: 'inherit' });
} catch (e) {
  console.log('Failed:', e.message);
}
