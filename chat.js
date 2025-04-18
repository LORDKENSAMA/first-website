// chat.js

// 使用 Firebase 9 compat 版
const auth = firebase.auth();
const db = firebase.firestore();

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const userName = document.getElementById("userName");

// Kensama 的 UID（你可以在控制台查看对应昵称的 UID）
const KENSAMA_UID = "Kensama_UID_请替换"; // ⚠️ 替换成你自己的 Kensama UID

// 显示当前用户信息
auth.onAuthStateChanged(user => {
  if (user) {
    userName.textContent = user.displayName || "用户";

    // 监听自己和 Kensama 的聊天消息
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

    // 发送消息（回车发送）
    messageInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text === "") return;

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
  }
});
