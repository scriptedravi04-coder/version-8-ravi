import fs from 'fs';
let code = fs.readFileSync('src/components/chat/ChatBox.jsx', 'utf8');

// replace scrollRef with messagesEndRef

const targetStr = `  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const scrollRef = useRef(null);`;

const newStr = `  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);`;

code = code.replace(targetStr, newStr);

const scrollTargetStr = `  useEffect(() => {
    if (scrollRef.current) {
      // Just auto-scroll to bottom to ensure new messages are visible
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
      }, 100);
    }
  }, [messages]);`;

const scrollNewStr = `  useEffect(() => {
    // Just auto-scroll to bottom to ensure new messages are visible
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [messages, currentThread]);`;

code = code.replace(scrollTargetStr, scrollNewStr);

const htmlTargetStr = `          </AnimatePresence>
        </div>`;

const htmlNewStr = `          </AnimatePresence>
          <div ref={messagesEndRef} style={{ height: 1 }} />
        </div>`;

code = code.replace(htmlTargetStr, htmlNewStr);

fs.writeFileSync('src/components/chat/ChatBox.jsx', code);
console.log("Success adding messagesEndRef");
