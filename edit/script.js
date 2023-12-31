class NovelEditor {
  constructor() {
    this.novels = JSON.parse(localStorage.getItem("novels")) || [];
    this.currentNovelId = this.getNovelIdFromQuery();
    this.currentNovel = this.novels.find(
      (novel) => novel.id === this.currentNovelId
    );
    this.currentSceneId = null;
    this.currentScene = null;
    this.initializeGraph();
    document
      .getElementById("addSceneButton")
      .addEventListener("click", () => this.addScene());
    document
      .getElementById("deleteSceneButton")
      .addEventListener("click", () => this.deleteScene());
  }

  getNovelIdFromQuery() {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("novelId");
  }

  saveNovels() {
    localStorage.setItem("novels", JSON.stringify(this.novels));
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
      .append("line")
      .attr("class", "link")
      .attr(
        "x1",
        (d) => this.currentNovel.scenes.find((scene) => scene.id === d.from).x
      )
      .attr(
        "y1",
        (d) => this.currentNovel.scenes.find((scene) => scene.id === d.from).y
      )
      .attr(
        "x2",
        (d) => this.currentNovel.scenes.find((scene) => scene.id === d.to).x
      )
      .attr(
        "y2",
        (d) => this.currentNovel.scenes.find((scene) => scene.id === d.to).y
      );
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
      .on("click", (d) => this.handleSceneSelection(d.id));
  }

  addScene() {
    const newScene = {
      id: self.crypto.randomUUID(),
      name: "新しいシーン",
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
      from: this.currentSceneId,
      to: newScene.id,
      type: "solid",
    });
    this.saveNovels();
    this.updateGraph();
  }

  deleteScene() {
    if (!this.currentSceneId) {
      alert("削除するシーンを選択してください。");
      return;
    }

    this.currentNovel.scenes = this.currentNovel.scenes.filter(
      (scene) => scene.id !== this.currentSceneId
    );
    this.currentNovel.connections = this.currentNovel.connections.filter(
      (connection) =>
        connection.from !== this.currentSceneId &&
        connection.to !== this.currentSceneId
    );

    this.currentSceneId = null;
    this.currentScene = null;
    this.saveNovels();
    this.updateGraph();
  }

  showContextMenu(d) {
    d3.event.preventDefault();
    this.currentSceneId = d.id;
    this.currentScene = d;
    const menu = document.getElementById("contextMenu");
    menu.style.display = "block";
    menu.style.left = `${d3.event.pageX}px`;
    menu.style.top = `${d3.event.pageY}px`;
  }

  handleSceneSelection(sceneId) {
    this.currentSceneId = sceneId;
    this.currentScene = this.currentNovel.scenes.find(
      (scene) => scene.id === sceneId
    );
    this.updateSceneTabs();
    this.updateSceneEditor();
    this.updateDraftArea();
  }

  updateSceneTabs() {
    const tabs = document.getElementById("noteTabs");
    tabs.innerHTML = "";

    this.currentScene.notes.forEach((note) => {
      const tab = document.createElement("button");
      tab.textContent = note.type;
      tab.onclick = () => this.updateSceneEditor(note.type);
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
    this.updateSceneTabs();
    this.updateSceneEditor(noteType);
    this.saveNovels();
  }

  updateSceneEditor(noteType) {
    const editor = document.getElementById("noteEditor");
    editor.innerHTML = "";
    const note = this.currentScene.notes.find((n) => n.type === noteType);

    const textarea = document.createElement("textarea");
    textarea.value = note ? note.content : "";
    textarea.oninput = () => {
      note.content = textarea.value;
      this.saveNovels();
    };
    editor.appendChild(textarea);
  }

  updateDraftArea() {
    const draftArea = document.getElementById("draftArea");
    draftArea.value = this.currentScene.content;
    draftArea.oninput = () => {
      this.currentScene.content = draftArea.value;
      this.saveNovels();
    };
  }

  hideContextMenu() {
    const menu = document.getElementById("contextMenu");
    menu.style.display = "none";
  }
}

// アプリケーションの初期化
const novelEditor = new NovelEditor();
d3.select("body").on("click", () => novelEditor.hideContextMenu());
