// auth.js

const auth = firebase.auth();

// 获取输入框元素
const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");

// 注册函数
function register() {
  const nickname = nicknameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!nickname || !password) {
    alert("请输入昵称和密码");
    return;
  }

  const email = `${nickname}@kensama.com`; // 构造虚拟邮箱

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("注册成功，请点击登录");
    })
    .catch(error => {
      alert("注册失败：" + error.message);
    });
}

// 登录函数
function login() {
  const nickname = nicknameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!nickname || !password) {
    alert("请输入昵称和密码");
    return;
  }

  const email = `${nickname}@kensama.com`;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      if (nickname === "kensama") {
        window.location.href = "admin-pro.html";
      } else {
        window.location.href = "chat.html";
      }
    })
    .catch(error => {
      alert("登录失败：" + error.message);
    });
}
