const auth = firebase.auth();
const db = firebase.firestore();

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const userName = document.getElementById("userName");

// 已查到 Kensama 的 UID
const KENSAMA_UID = "G2Lx6MrB8gSUcUbkUSpt5qk7BTA3";

auth.onAuthStateChanged(user => {
  if (!user) return;

  userName.textContent = user.displayName || "用户";

  // 实时监听消息
  db.collection("privateMessages")
    .where("participants", "array-contains", user.uid)
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        if (
          (msg.from === user.uid && msg.to === KENSAMA_UID) ||
          (msg.from === KENSAMA_UID && msg.to === user.uid)
        ) {
          const div = document.createElement("div");
          div.textContent = `${msg.from === user.uid ? "我" : "Kensama"}: ${msg.text}`;
          chatBox.appendChild(div);
        }
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });

  // 回车键发送消息
  messageInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (!text) return;

      await db.collection("privateMessages").add({
        from: user.uid,
        to: KENSAMA_UID,
        participants: [user.uid, KENSAMA_UID],
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      messageInput.value = "";
    }
  });
});
