const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-info").innerText = "你好, " + user.displayName;
    loadMessages(user);
  } else {
    window.location.href = "index.html";
  }
});

function sendMessage() {
  const message = document.getElementById("message-input").value;
  const user = auth.currentUser;
  if (message.trim() === "") return;

  db.collection("messages").add({
    from: user.displayName,
    to: "Kensama",
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("message-input").value = "";
}

function loadMessages(user) {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chat-box");
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        if ((data.from === user.displayName && data.to === "Kensama") ||
            (data.from === "Kensama" && data.to === user.displayName)) {
          const msgDiv = document.createElement("div");
          msgDiv.textContent = data.from + ": " + data.message;
          chatBox.appendChild(msgDiv);
        }
      });
    });
}