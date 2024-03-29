const quillSettings = {
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["link", "image", "video", "blockquote", "code-block", "formula"],
      [{ list: "bullet" }, { list: "ordered" }],
      [{ color: [] }, { background: [] }],
    ],
  },
  placeholder: "ここに入力してください。",
  theme: "snow",
}

class NovelEditor {
  constructor() {
    this.novels = JSON.parse(localStorage.getItem("novels")) || [];
    if (this.novels.length === 0 || !localStorage.getItem("novelId")) {
      window.location.href = "../";
    }
    this.currentNovel = this.novels.find(
      (novel) => novel.id === localStorage.getItem("novelId")
    );
    this.currentScene = this.currentNovel.scenes[0];
    this.currentNote = this.currentScene.notes[0];
    this.initializeGraph();
    this.initializeNote();
    this.initializeDraftArea();
    document.getElementById("novelTitle").textContent = this.currentNovel.title;
    document
      .getElementById("addSceneButton")
      .addEventListener("click", () => this.addScene());
    document
      .getElementById("deleteSceneButton")
      .addEventListener("click", () => this.deleteScene());
  }

  saveNovels() {
    localStorage.setItem("novels", JSON.stringify(this.novels));
  }

  initializeNote() {
    this.noteEditor = new Quill("#noteEditor", quillSettings);
  }

  initializeDraftArea() {
    this.draftAreaEditor = new Quill("#draftAreaEditor", quillSettings);
  }

  initializeGraph() {
    const width = "100%";
    const height = "100%";
    this.svg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    this.updateGraph();
  }

  updateGraph() {
    this.svg.selectAll("*").remove();
    this.drawLinks();
    this.drawNodes();
  }

  drawLinks() {
    this.svg
      .selectAll(".link")
      .data(this.currentNovel.connections)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        // ノードの位置を取得
        const source = this.currentNovel.scenes.find((scene) => scene.id === d.from);
        const target = this.currentNovel.scenes.find((scene) => scene.id === d.to);

        // 制御点の計算（ここを調整して曲線を変える）
        const controlX1 = (source.x + target.x) / 2;
        const controlY1 = source.y;
        const controlX2 = (source.x + target.x) / 2;
        const controlY2 = target.y;

        // 3次ベジエ曲線のパスを返す
        return `M${source.x},${source.y}C${controlX1},${controlY1},${controlX2},${controlY2},${target.x},${target.y}`;
      });

  }

  dragStarted(node) {
    d3.select(node).raise().classed("active", true);
  }

  dragged(d) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    this.saveNovels();
    this.updateGraph();
  }

  drawNodes() {
    const drag = d3
      .drag()
      .on("start", (_, i, nodes) => this.dragStarted(nodes[i]))
      .on("drag", (d) => this.dragged(d));

    const self = this; // `this` の参照を保存
    // ノードの描画
    this.svg
      .selectAll(".node")
      .data(this.currentNovel.scenes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .call(drag)
      .on("contextmenu", (d) => this.showContextMenu(d))
      .on("click", function(d) {
        self.currentScene = d;
        self.handleSceneSelection();

        // すべてのノードの色をリセット
        d3.selectAll(".node").style("fill", "#40592F");
        // クリックされたノードの色を変更
        d3.select(this).style("fill", "#9FA46D");
      });

    // テキスト要素の描画
    this.svg
      .selectAll(".node-text")
      .data(this.currentNovel.scenes)
      .enter()
      .append("text")
      .attr("class", "node-text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 20)
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px");
  }

  addScene() {
    const sceneName = prompt("新しいシーンの名前を入力してください。", "新しいシーン");
    if (sceneName === null || sceneName.trim() === "") {
      return;
    }

    const newScene = {
      id: self.crypto.randomUUID(),
      name: sceneName,
      notes: [
        { type: "概要", content: "" },
        { type: "人物", content: "" },
      ],
      content: "",
      x: this.currentScene ? this.currentScene.x + 50 : 100,
      y: this.currentScene ? this.currentScene.y : 100,
    };

    this.currentNovel.scenes.push(newScene);
    this.currentNovel.connections.push({
      from: this.currentScene.id,
      to: newScene.id,
      type: "solid",
    });
    this.saveNovels();
    this.updateGraph();
  }

  deleteScene() {
    if (!this.currentScene.id) {
      alert("削除するシーンを選択してください。");
      return;
    }

    this.currentNovel.scenes = this.currentNovel.scenes.filter(
      (scene) => scene.id !== this.currentScene.id
    );
    this.currentNovel.connections = this.currentNovel.connections.filter(
      (connection) =>
        connection.from !== this.currentScene.id &&
        connection.to !== this.currentScene.id
    );

    this.currentScene = this.currentNovel.scenes[0];
    this.saveNovels();
    this.updateGraph();
  }

  showContextMenu(d) {
    d3.event.preventDefault();
    this.currentScene = d;
    const menu = document.getElementById("contextMenu");
    menu.style.display = "block";
    menu.style.left = `${d3.event.pageX}px`;
    menu.style.top = `${d3.event.pageY}px`;
  }

  handleSceneSelection() {
    this.updateSceneTabs();
    this.updateNoteEditor();
    this.updateDraftArea();
  }

  updateSceneTabs() {
    const tabs = document.getElementById("noteTabs");
    tabs.innerHTML = "";

    this.currentScene.notes.forEach((note) => {
      const tab = document.createElement("button");
      tab.textContent = note.type;
      tab.onclick = () => {
        this.currentNote = note;
        this.handleSceneSelection();
      };
      tabs.appendChild(tab);
    });

    const addTab = document.createElement("button");
    addTab.textContent = "+";
    addTab.type = "button";
    addTab.onclick = () => this.addNote();
    tabs.appendChild(addTab);
  }

  addNote() {
    const noteType = prompt("ノートの種類を入力してください。");
    if (!noteType) {
      return;
    }
    const note = {
      type: noteType,
      content: "",
    };
    this.currentScene.notes.push(note);
    this.currentNote = note;
    this.saveNovels();
    this.handleSceneSelection();
  }

  updateNoteEditor() {
    document.getElementById("noteTabTitle").textContent = this.currentNote.type;
    this.noteEditor.setContents(this.currentNote.content);
    this.noteEditor.off("text-change");
    this.noteEditor.on("text-change", () => {
      this.currentNote.content = this.noteEditor.getContents();
      this.saveNovels();
    })
  }

  updateDraftArea() {
    document.getElementById("draftAreaTitle").textContent = this.currentScene.name + "の本文";
    this.draftAreaEditor.setContents(this.currentScene.content);
    this.draftAreaEditor.off("text-change");
    this.draftAreaEditor.on("text-change", () => {
      this.currentScene.content = this.draftAreaEditor.getContents();
      this.saveNovels();
    });
  }

  hideContextMenu() {
    const menu = document.getElementById("contextMenu");
    menu.style.display = "none";
  }
}

// アプリケーションの初期化
const novelEditor = new NovelEditor();
d3.select("body").on("click", () => novelEditor.hideContextMenu());
