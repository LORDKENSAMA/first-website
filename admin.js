// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 初始化
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
const auth = getAuth(app);
const db = getFirestore(app);

const userUl = document.getElementById("userUl");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatTitle = document.getElementById("chatTitle");

let selectedUser = null;

// 确保是 Kensama 登录
onAuthStateChanged(auth, user => {
  if (!user || user.email !== "kensama@kensama.com") {
    alert("无权限访问此页面");
    window.location.href = "index.html";
    return;
  }
  loadUserList();
});

// 加载用户列表
function loadUserList() {
  const q = query(collection(db, "messages"));
  const userSet = new Set();

  onSnapshot(q, snapshot => {
    userSet.clear();
    snapshot.forEach(doc => {
      const msg = doc.data();
      if (msg.from !== "kensama@kensama.com") {
        userSet.add(msg.from);
      }
    });

    userUl.innerHTML = "";
    userSet.forEach(userEmail => {
      const li = document.createElement("li");
      li.textContent = userEmail.split("@")[0];
      li.style.cursor = "pointer";
      li.onclick = () => selectUser(userEmail);
      userUl.appendChild(li);
    });
  });
}

// 选择用户查看聊天记录
function selectUser(userEmail) {
  selectedUser = userEmail;
  chatTitle.innerText = "与 " + selectedUser.split("@")[0] + " 的聊天";

  const q = query(
    collection(db, "messages"),
    where("from", "in", [userEmail, "kensama@kensama.com"]),
    where("to", "in", [userEmail, "kensama@kensama.com"]),
    orderBy("timestamp")
  );

  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message " + (msg.from === "kensama@kensama.com" ? "self" : "other");
      div.innerText = msg.text;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// 发送消息
sendBtn.onclick = async () => {
  const text = messageInput.value;
  if (!text.trim() || !selectedUser) return;

  await addDoc(collection(db, "messages"), {
    from: "kensama@kensama.com",
    to: selectedUser,
    text,
    timestamp: serverTimestamp()
  });

  messageInput.value = "";
};
