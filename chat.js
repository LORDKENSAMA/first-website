import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your Firebase config
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
const auth = getAuth();
const db = getFirestore(app);

// Kensama 的 UID
const KENSAMA_UID = "z1C1FFoA6ySZIGfCeHF2swlAUQM2";

// 登录状态变化时触发
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-info").textContent = `已登录：${user.displayName || user.email}`;
    loadMessages(user);
    setupSendMessage(user);
  } else {
    window.location.href = "index.html"; // 未登录，跳转回登录页
  }
});

// 发送消息
function setupSendMessage(user) {
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");

  sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (text === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        text,
        senderId: user.uid,
        receiverId: KENSAMA_UID,
        timestamp: serverTimestamp()
      });
      messageInput.value = "";
    } catch (error) {
      console.error("发送失败：", error);
    }
  });
}

// 加载消息（只显示和 Kensama 的对话）
function loadMessages(user) {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("senderId", "in", [user.uid, KENSAMA_UID]),
    orderBy("timestamp")
  );

  const chatBox = document.getElementById("chatBox");

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (
        (data.senderId === user.uid && data.receiverId === KENSAMA_UID) ||
        (data.senderId === KENSAMA_UID && data.receiverId === user.uid)
      ) {
        const msg = document.createElement("div");
        msg.textContent = `${data.senderId === user.uid ? "我" : "Kensama"}: ${data.text}`;
        chatBox.appendChild(msg);
      }
    });
  });
}

// 登出按钮
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});
