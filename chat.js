const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// 监听登录状态
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    const email = user.email; // 例：testuser@kensama.com
    const nickname = email.split("@")[0];
    document.getElementById("userName").textContent = nickname;

    // 加载聊天记录
    loadMessages(nickname);
  } else {
    window.location.href = "index.html"; // 未登录，跳回首页
  }
});

// 加载消息（只显示当前用户和 Kensama 的对话）
function loadMessages(nickname) {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";

      snapshot.forEach(doc => {
        const msg = doc.data();
        const isSelf = msg.sender === currentUser.uid;
        const isToMe = msg.receiver === currentUser.uid;

        // 显示用户和 Kensama 的私密聊天
        if (
          (msg.senderNickname === nickname && msg.receiverNickname === "kensama") ||
          (msg.senderNickname === "kensama" && msg.receiverNickname === nickname)
        ) {
          const p = document.createElement("p");
          p.textContent = msg.text;
          p.style.textAlign = isSelf ? "right" : "left";
          chatBox.appendChild(p);
        }
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// 发送消息（发送给 Kensama）
document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentUser) return;

  const nickname = currentUser.email.split("@")[0];

  db.collection("messages").add({
    text: text,
    sender: currentUser.uid,
    senderNickname: nickname,
    receiverNickname: "kensama",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    input.value = "";
  });
}
