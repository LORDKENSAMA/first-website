// chat.js - module 版本
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ✅ Firebase 配置（根据你的 firebase-config.js）
const firebaseConfig = {
  apiKey: "AIzaSyCUvPZM7a7ciEvAMB1kDudc6ROnoWPGqvg",
  authDomain: "kensamawebsite.firebaseapp.com",
  projectId: "kensamawebsite",
  storageBucket: "kensamawebsite.appspot.com",
  messagingSenderId: "33823463857",
  appId: "1:33823463857:web:477a5078ce99cdd5f78590",
  measurementId: "G-CVL61HZMY7"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 获取 DOM 元素
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const userName = document.getElementById("userName");

let currentUser = null;

// 监听用户登录状态
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userName.textContent = user.displayName || user.email;

    // 加载与 Kensama 的聊天记录
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    onSnapshot(q, (snapshot) => {
      chatBox.innerHTML = ""; // 清空旧消息
      snapshot.forEach((doc) => {
        const data = doc.data();
        // 只显示自己和 Kensama 的消息
        if (
          (data.senderName === user.uid && data.receiverName === "z1C1FFoA6ySZIGfCeHF2swlAUQM2") ||
          (data.senderName === "z1C1FFoA6ySZIGfCeHF2swlAUQM2" && data.receiverName === user.uid)
        ) {
          const div = document.createElement("div");
          div.textContent = `${data.senderDisplayName || data.senderName}: ${data.text}`;
          chatBox.appendChild(div);
        }
      });

      // 自动滚到底部
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } else {
    alert("请先登录！");
    window.location.href = "index.html"; // 未登录跳转回登录页
  }
});

// 发送消息
messageInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && messageInput.value.trim() !== "") {
    const text = messageInput.value.trim();
    await addDoc(collection(db, "messages"), {
      text,
      timestamp: new Date(),
      senderName: currentUser.uid,
      senderDisplayName: currentUser.displayName || currentUser.email,
      receiverName: "z1C1FFoA6ySZIGfCeHF2swlAUQM2", // 始终发给 Kensama
    });
    messageInput.value = "";
  }
});
