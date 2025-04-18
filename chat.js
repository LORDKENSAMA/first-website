const auth = firebase.auth();
const db = firebase.firestore();
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("user-info");
const KENSAMA_UID = "z1C1FFoA6ySZIGfCeHF2swlAUQM2";

let currentUser = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    userInfo.textContent = `已登录：${user.displayName || user.email}`;
    loadMessages();
  } else {
    window.location.href = "index.html";
  }
});

function loadMessages() {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          (data.sender === currentUser.uid && data.receiver === KENSAMA_UID) ||
          (data.sender === KENSAMA_UID && data.receiver === currentUser.uid)
        ) {
          const div = document.createElement("div");
          div.textContent = (data.sender === currentUser.uid ? "我" : "Kensama") + "：" + data.text;
          chatBox.appendChild(div);
        }
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = messageInput.value.trim();
    if (text) {
      db.collection("messages").add({
        sender: currentUser.uid,
        receiver: KENSAMA_UID,
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      messageInput.value = "";
    }
  }
});

logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});
