import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

const targetStr = `  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const isAtBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop <= scrollRef.current.clientHeight + 100;
      // Scroll if we're already near bottom, or if it's the first load
      if (isAtBottom) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);`;

const newStr = `  useEffect(() => {
    if (scrollRef.current) {
      // Just auto-scroll to bottom to ensure new messages are visible
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
      }, 100);
    }
  }, [messages]);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
  console.log("Success modifying ChatBox scroll logic");
} else {
  console.log("Not found ChatBox scroll logic");
}

