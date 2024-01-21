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
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        scenes: [
          {
            id: self.crypto.randomUUID(),
            name: "はじまり",
            notes: [
              { type: "概要", content: "" },
              { type: "人物", content: "" },
            ],
            content: "",
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
    fileList.className = "d-flex flex-wrap";
    let novels = JSON.parse(localStorage.getItem("novels")) || [];
    novels = novels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    novels.forEach((novel) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.width = "18rem";
      card.style.margin = "5px";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      const cardTitle = document.createElement("h5");
      cardTitle.className = "card-title";
      cardTitle.textContent = novel.title || "無題の小説";

      const cardText = document.createElement("p");
      cardText.className = "card-text";
      cardText.innerText = `作成日時: ${novel.createdAt} \n 最終編集時点: ${novel.updatedAt}`;

      const editButton = document.createElement("button");
      editButton.className = "btn btn-success ml-auto";
      editButton.textContent = "編集";
      editButton.addEventListener("click", function(event) {
        event.stopPropagation(); // カードのクリックイベントを止める
        localStorage.setItem("novelId", novel.id);
        window.location.href = `./edit`;
      });

      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardText);
      cardBody.appendChild(editButton);
      card.appendChild(cardBody);

      card.addEventListener("click", function() {
        localStorage.setItem("novelId", novel.id);
        window.location.href = `./edit`;
      });
      fileList.appendChild(card);
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