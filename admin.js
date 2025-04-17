import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 显示所有发过消息的用户
const q = query(collection(db, "privateMessages"));
onSnapshot(q, snapshot => {
  const users = new Set();
  snapshot.forEach(doc => {
    const msg = doc.data();
    if (msg.receiver === "kensama") {
      users.add(msg.sender);
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
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.textContent = `${msg.sender}：${msg.message}`;
      div.className = "message " + (msg.sender === "kensama" ? "self" : "other");
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !selectedUser) return;
  await addDoc(collection(db, "privateMessages"), {
    sender: "kensama",
    receiver: selectedUser,
    message: text,
    timestamp: new Date()
  });
  messageInput.value = "";
};
