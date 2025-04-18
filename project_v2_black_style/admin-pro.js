const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user && user.displayName === "Kensama") {
    loadUserList();
  } else {
    window.location.href = "index.html";
  }
});

function loadUserList() {
  db.collection("messages").get().then(snapshot => {
    const users = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.from !== "Kensama") users.add(data.from);
    });

    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    users.forEach(nickname => {
      const btn = document.createElement("button");
      btn.textContent = nickname;
      btn.onclick = () => loadChat(nickname);
      userList.appendChild(btn);
    });
  });
}

function loadChat(nickname) {
  currentUser = nickname;
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chat-box");
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        if ((data.from === nickname && data.to === "Kensama") ||
            (data.from === "Kensama" && data.to === nickname)) {
          const msgDiv = document.createElement("div");
          msgDiv.textContent = data.from + ": " + data.message;
          chatBox.appendChild(msgDiv);
        }
      });
    });
}

function sendReply() {
  const message = document.getElementById("reply-input").value;
  if (!currentUser || message.trim() === "") return;

  db.collection("messages").add({
    from: "Kensama",
    to: currentUser,
    message: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("reply-input").value = "";
}