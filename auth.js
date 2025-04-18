const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById("register").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nickname = document.getElementById("nickname").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({ displayName: nickname });
    })
    .then(() => {
      alert("注册成功");
    })
    .catch((error) => {
      console.error("注册错误:", error);
    });
});

document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const nickname = user.displayName;

      if (nickname && nickname.toLowerCase() === "kensama") {
        window.location.href = "admin-pro.html";
      } else {
        window.location.href = "chat.html";
      }
    })
    .catch((error) => {
      console.error("登录错误:", error);
    });
});
