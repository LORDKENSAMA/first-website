// 初始化 Firebase 应用（firebase-config.js 中已经配置）
const auth = firebase.auth();
const db = firebase.firestore();

// 页面元素
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("user-info");
const userNameDisplay = document.getElementById("user-name");

let currentUser;

// 监听认证状态
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    userNameDisplay.textContent = `已登录：${user.displayName || user.email}`;
    loadMessages();
  } else {
    // 未登录，跳回登录页
    window.location.href = "index.html";
  }
});

// 登出按钮
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});

// 加载聊天记录（仅显示自己和 Kensama 的消息）
function loadMessages() {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot((snapshot) => {
      chatBox.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const isMyMessage = data.sender === currentUser.uid || data.receiver === currentUser.uid;
        const isToOrFromKensama = data.sender === "z1C1FFoA6ySZIGfCeHF2swlAUQM2" || data.receiver === "z1C1FFoA6ySZIGfCeHF2swlAUQM2";
        if (isMyMessage && isToOrFromKensama) {
          const div = document.createElement("div");
          const senderName = data.sender === currentUser.uid ? "我" : "Kensama";
          div.textContent = `${senderName}：${data.text}`;
          chatBox.appendChild(div);
        }
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// 发送消息
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = messageInput.value.trim();
    if (text) {
      db.collection("messages").add({
        sender: currentUser.uid,
        receiver: "z1C1FFoA6ySZIGfCeHF2swlAUQM2", // Kensama 的 UID
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      messageInput.value = "";
    }
  }
});
