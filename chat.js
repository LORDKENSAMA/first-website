// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 初始化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");

let currentUser = null;

// 监听登录状态
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    listenToMessages();
  }
});

// 监听聊天记录
function listenToMessages() {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("from", "in", [currentUser.email, "kensama@kensama.com"]),
    where("to", "in", [currentUser.email, "kensama@kensama.com"]),
    orderBy("timestamp")
  );

  onSnapshot(q, snapshot => {
    chatBox.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const who = data.from === currentUser.email ? "你" : "Kensama";
      chatBox.innerHTML += `${who}：${data.text}\n`;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 发送消息
messageInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && messageInput.value.trim() !== "") {
    const text = messageInput.value;
    await addDoc(collection(db, "messages"), {
      from: currentUser.email,
      to: "kensama@kensama.com",
      text,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
  }
});
