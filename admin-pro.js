// admin-pro.js - 管理后台：支持 Enter 发送 + 实时刷新消息
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, query, where,
  orderBy, onSnapshot, addDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

let selectedUser = null;
let unsubscribe = null;

// 监听发过消息的用户
const q = query(collection(db, "privateMessages"));
onSnapshot(q, snapshot => {
  const users = new Set();
  snapshot.forEach(doc => {
    const msg = doc.data();
    const receiver = msg.receiver?.toLowerCase();
    const sender = msg.sender?.toLowerCase();
    if (receiver === "kensama" && sender !== "kensama") {
      users.add(sender);
    }
  });

  userUl.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    li.style.cursor = "pointer";
    li.onclick = () => loadChat(user);
    userUl.appendChild(li);
  });
});

// 加载聊天记录
function loadChat(user) {
  selectedUser = user;
  chatTitle.textContent = `与 ${user} 的对话`;
  messagesDiv.innerHTML = "";

  if (unsubscribe) unsubscribe();

  const chatQuery = query(
    collection(db, "privateMessages"),
    where("sender", "in", [user, "kensama"]),
    where("receiver", "in", [user, "kensama"]),
    orderBy("timestamp")
  );

  unsubscribe = onSnapshot(chatQuery, snapshot => {
    const messageList = [];
    snapshot.forEach(doc => {
      const msg = doc.data();
      messageList.push(msg);
    });

    messagesDiv.innerHTML = "";
    messageList.forEach(msg => {
      const div = document.createElement("div");
      div.className = "message " + (msg.sender === "kensama" ? "self" : "other");
      div.textContent = msg.message;
      messagesDiv.appendChild(div);
    });

    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 50);
  });
}

// 发送消息的函数（供按钮或键盘使用）
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !selectedUser) return;

  await addDoc(collection(db, "privateMessages"), {
    sender: "kensama",
    receiver: selectedUser,
    message: text,
    timestamp: new Date()
  });

  messageInput.value = "";

  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 50);
}

// 支持点击按钮发送
sendBtn.onclick = sendMessage;

// 支持按 Enter 发送
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
