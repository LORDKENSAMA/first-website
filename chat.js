// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 配置（你自己的配置）
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

const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const userNameDisplay = document.getElementById("userName");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    userNameDisplay.textContent = user.displayName || "匿名用户";

    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    onSnapshot(q, snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        if (
          (msg.sender === user.uid && msg.receiver === "Kensama") ||
          (msg.sender === "Kensama" && msg.receiver === user.uid)
        ) {
          const div = document.createElement("div");
          div.classList.add("message", msg.sender === user.uid ? "self" : "other");
          div.textContent = msg.text;
          messagesDiv.appendChild(div);
        }
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  } else {
    window.location.href = "login.html";
  }
});

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (text && currentUser) {
    await addDoc(collection(db, "messages"), {
      text: text,
      sender: currentUser.uid,
      receiver: "Kensama",
      timestamp: new Date()
    });
    messageInput.value = "";
  }
});
