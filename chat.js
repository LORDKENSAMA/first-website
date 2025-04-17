// chat.js - 用户与 Kensama 私聊逻辑
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCUvPZM7a7ciEvAMB1kDudc6ROnoWPGqvg",
  authDomain: "kensamawebsite.firebaseapp.com",
  projectId: "kensamawebsite",
  storageBucket: "kensamawebsite.appspot.com",
  messagingSenderId: "33823463857",
  appId: "1:33823463857:web:477a5078ce99cdd5f78590",
  measurementId: "G-CVL61HZMY7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM 元素引用
const userNameSpan = document.getElementById("userName");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");

let currentUser = null;
let unsubscribe = null;

// 监听用户登录状态
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("未登录，请返回首页登录");
    window.location.href = "index.html";
    return;
  }

  const email = user.email;
  const nickname = email.split("@")[0].toLowerCase();
  currentUser = nickname;
  userNameSpan.textContent = currentUser;

  // 设置 Firestore 消息监听
  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "privateMessages"), orderBy("timestamp"));
  unsubscribe = onSnapshot(q, snapshot => {
    chatBox.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const sender = msg.sender?.toLowerCase();
      const receiver = msg.receiver?.toLowerCase();

      // 只显示当前用户与 Kensama 的对话
      if (
        (sender === currentUser && receiver === "kensama") ||
        (sender === "kensama" && receiver === currentUser)
      ) {
        const who = sender === currentUser ? "你" : "Kensama";
        chatBox.innerHTML += `${who}：${msg.message}\n`;
      }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // 发送消息事件
  input.addEventListener("keydown", async e => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      const message = input.value.trim();
      await addDoc(collection(db, "privateMessages"), {
        sender: currentUser,
        receiver: "kensama",
        message,
        timestamp: new Date()
      });
      input.value = "";
    }
  });
});
