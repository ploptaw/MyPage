// ダークモードをトグルする関数
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");
}

//初期状態をダークモードにする
document.body.classList.add("dark-mode");
