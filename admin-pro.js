// admin-pro.js - 支持 Firestore "messages" 集合，管理员实时聊天界面
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, query, where,
  orderBy, onSnapshot, addDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
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

  const userUl = document.getElementById("userUl");
  const messagesDiv = document.getElementById("messages");
  const chatTitle = document.getElementById("chatTitle");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  const KENSAMA_UID = "z1C1FFoA6ySZIGfCeHF2swlAUQM2"; // Kensama 的 UID
  let selectedUser = null;
  let unsubscribe = null;

  // ✅ 实时监听所有发给 Kensama 的消息，提取发件人 UID 列表
  const userQuery = query(
    collection(db, "messages"),
    where("receiver", "==", KENSAMA_UID)
  );

  onSnapshot(userQuery, snapshot => {
    const users = new Set();
    snapshot.forEach(doc => {
      const msg = doc.data();
      if (msg.sender !== KENSAMA_UID) {
        users.add(msg.sender);
      }
    });

    // 更新用户列表
    userUl.innerHTML = "";
    users.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user;
      li.style.cursor = "pointer";
      li.onclick = () => loadChat(user);
      userUl.appendChild(li);
    });
  });

  // 💬 加载与选中用户的聊天记录
  function loadChat(user) {
    selectedUser = user;
    chatTitle.textContent = `与 ${user} 的对话`;
    messagesDiv.innerHTML = "";

    if (unsubscribe) unsubscribe();

    const chatQuery = query(
      collection(db, "messages"),
      where("sender", "in", [user, KENSAMA_UID]),
      where("receiver", "in", [user, KENSAMA_UID]),
      orderBy("timestamp")
    );

    unsubscribe = onSnapshot(chatQuery, snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.className = "message " + (msg.sender === KENSAMA_UID ? "self" : "other");
        div.textContent = msg.text;
        messagesDiv.appendChild(div);
      });

      setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 50);
    });
  }

  // ✉️ 发送消息
  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !selectedUser) return;

    await addDoc(collection(db, "messages"), {
      sender: KENSAMA_UID,
      receiver: selectedUser,
      text: text,
      timestamp: new Date()
    });

    messageInput.value = "";
  }

  sendBtn.onclick = sendMessage;

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});
