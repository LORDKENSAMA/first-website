// chat.js
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    const nickname = user.email.split("@")[0];
    document.getElementById("userName").textContent = nickname;
    loadMessages(nickname);
  } else {
    window.location.href = "index.html";
  }
});

// 加载当前用户与 Kensama 的私密消息
function loadMessages(nickname) {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";

      snapshot.forEach(doc => {
        const msg = doc.data();

        if (
          (msg.senderNickname === nickname && msg.receiverNickname === "kensama") ||
          (msg.senderNickname === "kensama" && msg.receiverNickname === nickname)
        ) {
          const p = document.createElement("p");
          p.textContent = msg.text;
          p.style.textAlign = msg.senderNickname === nickname ? "right" : "left";
          chatBox.appendChild(p);
        }
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// 发送消息给 Kensama
document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentUser) return;

  const nickname = currentUser.email.split("@")[0];

  db.collection("messages").add({
    text: text,
    sender: currentUser.uid,
    senderNickname: nickname,
    receiverNickname: "kensama",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    input.value = "";
  });
}
