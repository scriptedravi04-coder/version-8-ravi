import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const regex = /isNegotiatingFee \? \([\s\S]*?\) : \(\s*\/\* OTP Signature Form or Sign-off Buttons \*\//m;

if (code.match(regex)) {
  code = code.replace(regex, `/* OTP Signature Form or Sign-off Buttons */`);
  // And we need to remove the matching closing parenthesis for isNegotiatingFee
  // Wait, let's just do a simpler replacement or write a script to extract and replace the block.
}

// Let's use simple string manipulation.
