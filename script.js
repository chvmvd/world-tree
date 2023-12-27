document.addEventListener("DOMContentLoaded", function() {
  const fileList = document.getElementById("fileList");
  const newFileButton = document.getElementById("newFile");

  // 新規ファイル作成
  newFileButton.addEventListener("click", function() {
    const fileName = prompt("新規ファイルの名前を入力してください:");
    if (fileName && fileName.trim() !== "") {
      const newFile = {
        id: self.crypto.randomUUID(),
        title: fileName.trim(),
        scenes: [
          {
            id: self.crypto.randomUUID(),
            name: "新しいシーン",
            notes: [
              { type: "概要", content: "これは概要です。" },
              { type: "人物", content: "これは人物です。" },
            ],
            content: "これは本文です。",
            x: 100,
            y: 100,
          },
        ],
        connections: [],
      };
      saveFile(newFile);
      localStorage.setItem("novelId", newFile.id);
      window.location.href = `./edit`;
    } else {
      alert("ファイル名が入力されていません。");
    }
  });

  // 既存のファイルをリストアップ
  function updateFileList() {
    fileList.innerHTML = "";
    const novels = JSON.parse(localStorage.getItem("novels")) || [];
    novels.forEach((novel) => {
      const fileElement = document.createElement("div");
      fileElement.textContent = novel.title || "無題の小説";
      fileElement.style.cursor = "pointer";
      localStorage.setItem("novelId", novel.id);
      fileElement.addEventListener("click", function() {
        window.location.href = `./edit`;
      });
      fileList.appendChild(fileElement);
    });
  }

  // ファイルを保存
  function saveFile(file) {
    const novels = JSON.parse(localStorage.getItem("novels")) || [];
    novels.push(file);
    localStorage.setItem("novels", JSON.stringify(novels));
    updateFileList();
  }

  updateFileList();
});