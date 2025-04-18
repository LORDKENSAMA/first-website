// chat.js

const auth = firebase.auth();
const db = firebase.firestore();

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const userName = document.getElementById("userName");

// Kensama 的 UID（查出来的是这个）
const KENSAMA_UID = "G2Lx6MrB8gSUcUbkUSpt5qk7BTA3";

// 等用户登录后再处理
auth.onAuthStateChanged(user => {
  if (!user) return;

  userName.textContent = user.displayName || "用户";

  // 监听与 Kensama 的消息
  db.collection("privateMessages")
    .where("participants", "array-contains", user.uid)
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();

        // 只显示自己和 Kensama 的消息
        if (
          (msg.from === user.uid && msg.to === KENSAMA_UID) ||
          (msg.from === KENSAMA_UID && msg.to === user.uid)
        ) {
          const div = document.createElement("div");
          div.textContent = `${msg.from === user.uid ? "我" : "Kensama"}: ${msg.text}`;
          chatBox.appendChild(div);
        }
      });

      // 滚动到底部
      chatBox.scrollTop = chatBox.scrollHeight;
    });

  // 发送消息（回车键）
  messageInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = messageInput.value.trim();
      if (text === "") return;

      try {
        await db.collection("privateMessages").add({
          from: user.uid,
          to: KENSAMA_UID,
          participants: [user.uid, KENSAMA_UID],
          text: text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        messageInput.value = "";
      } catch (err) {
        console.error("消息发送失败:", err);
        alert("消息发送失败，请检查控制台");
      }
    }
  });
});
