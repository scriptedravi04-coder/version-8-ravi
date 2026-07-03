import { fork } from "child_process";

const child = fork("backend/server.ts", [], {
  execArgv: ["--import", "tsx"],
  env: { ...process.env, NODE_OPTIONS: "--expose-gc" }
});

child.on("error", (err) => console.error("Child error:", err));

setTimeout(() => {
  console.log("Terminating child...");
  child.kill();
}, 5000);
