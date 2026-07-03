import { readFileSync } from 'fs';
try {
  console.log(readFileSync('/proc/762/cmdline', 'utf8').split('\0').join(' '));
} catch (e) {
  console.log('Failed:', e.message);
}
