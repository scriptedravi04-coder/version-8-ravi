const fs = require("fs");
let path = "src/contexts/AuthContext.jsx";
let content = fs.readFileSync(path, "utf8");
content = content.replace(
  /catch \(error\) \{\s*console\.error\("Error fetching user data from Firestore:", error\);\s*setUser\(null\);\s*\}/s,
  `catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          const fallbackUser = {
            id: firebaseUser.uid,
            user_id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            picture: firebaseUser.photoURL,
            role: "creator",
            onboarded: false
          };
          setUser(fallbackUser);
          localStorage.setItem("ybex_token", firebaseUser.uid);
        }`
);
fs.writeFileSync(path, content);
