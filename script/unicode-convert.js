// 履歴を保存するための配列
let history = [];

// 変換履歴を最大何件まで保存するか
const HISTORY_LIMIT = 10;

// DOMContentLoaded イベントリスナーを追加
document.addEventListener("DOMContentLoaded", () => {
  // 各要素への参照を一度だけ取得
  const inputText = document.getElementById("input-text");
  const inputUnicode = document.getElementById("input-unicode");
  const sectionText = document.getElementById("section-text");
  const outputDiv = document.getElementById("output");
  const outputUnicodeDiv = document.getElementById("output-unicode");
  const resultDiv = document.getElementById("result");

  // イベントリスナーを設定
  inputText.addEventListener("keydown", handleKeyDown(convertToUnicodeEscape));
  inputUnicode.addEventListener("keydown", handleKeyDown(convertToNormalText));
  sectionText.addEventListener("keydown", handleKeyDown(convertsection));

  // 変換関数
  function convertToUnicodeEscape() {
    const outputText = escapeText(inputText.value);
    updateOutput(outputDiv, outputText, "output-text");
    addToHistory(inputText.value, outputText);
  }

  function convertToNormalText() {
    const outputText = unescapeText(inputUnicode.value);
    updateOutput(outputUnicodeDiv, outputText, "output-unicode");
    addToHistory(outputText, inputUnicode.value);
  }

  function convertsection() {
    const convertedText = sectionText.value.replace(/§/g, "&");
    updateOutput(resultDiv, convertedText);
  }

  // ヘルパー関数
  function handleKeyDown(conversionFunction) {
    return (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        conversionFunction();
      }
    };
  }

  function updateOutput(outputElement, text, elementId = "") {
    outputElement.innerHTML = `
            <p>変換結果：</p>
            <textarea>${text}</textarea>
            ${
              elementId
                ? `<button class="copy-button" onclick="copyToClipboard('${elementId}')">テキストをコピー</button>`
                : ""
            }
        `;
  }
});

// テキストをクリップボードにコピーする関数
function copyToClipboard(elementId) {
  const inputElement = document.getElementById(
    elementId.replace("output-", "input-")
  );
  if (!inputElement) return;

  let copyText;
  switch (elementId) {
    case "output-text":
      copyText = escapeText(inputElement.value);
      break;
    case "output-unicode":
      copyText = unescapeText(inputElement.value);
      break;
    case "result":
      copyText = inputElement.value.replace(/§/g, "&");
      break;
    default:
      return;
  }

  navigator.clipboard
    .writeText(copyText)
    .then(() => {
      console.log("テキストがクリップボードにコピーされました");
    })
    .catch((err) => {
      console.error("クリップボードへのコピーに失敗しました", err);
    });
}

// 変換履歴に追加する関数
function addToHistory(input, output) {
  const time = new Date().toLocaleString();
  const historyTable = document.querySelector(".history-table tbody");
  const tr = document.createElement("tr");

  ["input", "output", "delete", "time"].forEach((key) => {
    const td = document.createElement("td");
    if (key === "delete") {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => {
        history = history.filter((h) => h.input !== input);
        tr.remove();
      });
      td.appendChild(deleteButton);
    } else {
      td.textContent = key === "time" ? time : key === "input" ? input : output;
    }
    tr.appendChild(td);
  });

  historyTable.insertBefore(tr, historyTable.firstChild);

  history.unshift({ input, output, time });
  if (history.length > HISTORY_LIMIT) {
    history.pop();
    if (historyTable.children.length > HISTORY_LIMIT) {
      historyTable.removeChild(historyTable.lastChild);
    }
  }
}

// テキストをユニコードエスケープシーケンスに変換する関数
function escapeText(text) {
  return text.replace(
    /[^\x00-\x7F]/g,
    (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

// ユニコードエスケープシーケンスをテキストに変換する関数
function unescapeText(unicode) {
  return unicode.replace(/\\u(\w{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}
