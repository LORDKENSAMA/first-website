import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    const nickname = user.email.split("@")[0];
    currentUser = nickname;
    document.getElementById("userName").innerText = nickname;

    const messagesRef = collection(db, "privateMessages");
    const q = query(messagesRef, orderBy("timestamp"));

    onSnapshot(q, snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        // 只显示和 kensama 的对话
        if (
          (msg.sender === currentUser && msg.receiver === "kensama") ||
          (msg.sender === "kensama" && msg.receiver === currentUser)
        ) {
          const who = msg.sender === currentUser ? "你" : msg.sender;
          chatBox.innerHTML += `${who}：${msg.message}<br>`;
        }
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
  }
});
