const auth = firebase.auth();
const db = firebase.firestore();

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nickname = document.getElementById("nickname").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user.updateProfile({ displayName: nickname });
    })
    .then(() => {
      window.location.href = "chat.html";
    })
    .catch((error) => {
      console.error("注册错误:", error.message);
    });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const nickname = userCredential.user.displayName;
      if (nickname === "Kensama") {
        window.location.href = "admin-pro.html";
      } else {
        window.location.href = "chat.html";
      }
    })
    .catch((error) => {
      console.error("登录错误:", error.message);
    });
}