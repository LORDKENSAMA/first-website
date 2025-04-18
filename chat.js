const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  const nickname = user.email.split("@")[0];
  document.getElementById("userName").textContent = nickname;

  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";

      snapshot.forEach(doc => {
        const msg = doc.data();

        const isBetweenUserAndKensama =
          (msg.senderNickname === nickname && msg.receiverNickname === "kensama") ||
          (msg.senderNickname === "kensama" && msg.receiverNickname === nickname);

        if (isBetweenUserAndKensama) {
          const p = document.createElement("p");
          p.textContent = msg.text;
          p.style.textAlign = msg.senderNickname === nickname ? "right" : "left";
          chatBox.appendChild(p);
        }
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
});

document.getElementById("messageInput").addEventListener("keydown", (e) => {
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
  });

  input.value = "";
}
