// chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, query,
  where, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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

const userNameSpan = document.getElementById("userName");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    const email = user.email;
    const nickname = email.split("@")[0].toLowerCase();
    currentUser = nickname;
    userNameSpan.textContent = nickname;

    const q = query(
      collection(db, "privateMessages"),
      where("sender", "in", [currentUser, "kensama"]),
      where("receiver", "in", [currentUser, "kensama"]),
      orderBy("timestamp")
    );

    onSnapshot(q, snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const who = msg.sender === currentUser ? "你" : "Kensama";
        chatBox.innerHTML += `${who}：${msg.message}\n`;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });

    input.addEventListener("keydown", async e => {
      if (e.key === "Enter" && input.value.trim() !== "") {
        await addDoc(collection(db, "privateMessages"), {
          sender: currentUser,
          receiver: "kensama",
          message: input.value.trim(),
          timestamp: new Date()
        });
        input.value = "";
      }
    });
  } else {
    alert("未登录，请返回主页重新登录");
    window.location.href = "index.html";
  }
});
