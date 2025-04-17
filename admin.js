// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCUvPZM7a7ciEvAMB1kDudc6ROnoWPGqvg",
  authDomain: "kensamawebsite.firebaseapp.com",
  projectId: "kensamawebsite",
  storageBucket: "kensamawebsite.filestorage.app",
  messagingSenderId: "33823463857",
  appId: "1:33823463857:web:477a5078ce99cdd5f78590",
  measurementId: "G-CVL61HZMY7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userUl = document.getElementById("userUl");
const chatTitle = document.getElementById("chatTitle");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let selectedUserId = null;

onAuthStateChanged(auth, async user => {
  if (!user || user.displayName !== "Kensama") {
    alert("仅限 Kensama 使用！");
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  await loadUserList();
});

async function loadUserList() {
  // 获取所有发给 Kensama 的用户
  const q = query(collection(db, "messages"), where("receiver", "==", "Kensama"));
  const snapshot = await getDocs(q);

  const userSet = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    userSet.add(data.sender);
  });

  userUl.innerHTML = "";
  userSet.forEach(uid => {
    const li = document.createElement("li");
    li.textContent = uid;
    li.style.cursor = "pointer";
    li.onclick = () => selectUser(uid);
    userUl.appendChild(li);
  });
}

function selectUser(uid) {
  selectedUserId = uid;
  chatTitle.textContent = `与 ${uid} 的对话`;

  const q = query(
    collection(db, "messages"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const isChatBetween = (
        (msg.sender === uid && msg.receiver === "Kensama") ||
        (msg.sender === "Kensama" && msg.receiver === uid)
      );
      if (isChatBetween) {
        const div = document.createElement("div");
        div.classList.add("message", msg.sender === "Kensama" ? "self" : "other");
        div.textContent = msg.text;
        messagesDiv.appendChild(div);
      }
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !selectedUserId) return;

  await addDoc(collection(db, "messages"), {
    text: text,
    sender: "Kensama",
    receiver: selectedUserId,
    timestamp: new Date()
  });

  messageInput.value = "";
};
