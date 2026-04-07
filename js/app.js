const input = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const count = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");

// ===== MUSIC =====
const music = document.getElementById("bgMusic");
const volumeControl = document.getElementById("volume");
const nowPlaying = document.getElementById("nowPlaying");

const playlist = [
  { name: "Lofi 1", src: "assets/GNDL.mp3" },
  { name: "Lofi 2", src: "assets/YERN.mp3" },
  { name: "Lofi 3", src: "assets/YNCUM.mp3" }
];

let currentIndex = 0;

function loadSong(i) {
  music.src = playlist[i].src;
  nowPlaying.textContent = "🎵 " + playlist[i].name;
}

function toggleMusic() {
  music.paused ? music.play() : music.pause();
}

function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
  music.play();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex);
  music.play();
}

volumeControl.addEventListener("input", () => {
  music.volume = volumeControl.value;
});

music.addEventListener("ended", nextSong);
loadSong(currentIndex);

// ===== TASK =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return "⏰ Hết hạn";

  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}m ${s}s`;
}

function renderTasks() {
  list.innerHTML = "";

  let filtered = tasks;

  if (filter === "active") filtered = tasks.filter(t => !t.completed);
  if (filter === "completed") filtered = tasks.filter(t => t.completed);

  const keyword = searchInput.value.toLowerCase();
  filtered = filtered.filter(t => t.text.toLowerCase().includes(keyword));

  filtered.forEach((task, i) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) span.classList.add("completed");

    if (task.deadline && new Date() > new Date(task.deadline)) {
      span.classList.add("overdue");
    }

    span.onclick = () => toggleTask(i);
    span.ondblclick = () => editTask(span, i);

    const time = document.createElement("small");
    if (task.deadline) {
      time.innerHTML = `
        ⏰ ${new Date(task.deadline).toLocaleString()}
        <br><span class="countdown">${getTimeLeft(task.deadline)}</span>
      `;
    }

    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.onclick = () => deleteTask(i);

    li.append(span, time, btn);
    list.appendChild(li);
  });

  count.textContent = `Total: ${tasks.length} | Done: ${tasks.filter(t => t.completed).length}`;
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    text,
    completed: false,
    deadline: timeInput.value,
    notified: false
  });

  input.value = "";
  timeInput.value = "";
  renderTasks();
}

function deleteTask(i) {
  if (!confirm("Xoá task?")) return;
  tasks.splice(i, 1);
  renderTasks();
}

function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  renderTasks();
}

function editTask(span, i) {
  const inp = document.createElement("input");
  inp.value = tasks[i].text;
  span.replaceWith(inp);
  inp.focus();

  inp.onblur = () => {
    tasks[i].text = inp.value;
    renderTasks();
  };

  inp.onkeydown = e => {
    if (e.key === "Enter") {
      tasks[i].text = inp.value;
      renderTasks();
    }
  };
}

function setFilter(type) {
  filter = type;
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  renderTasks();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

setInterval(() => {
  const now = new Date();

  tasks.forEach(t => {
    if (!t.completed && t.deadline) {
      const d = new Date(t.deadline);

      if (now >= d && !t.notified) {
        if (Notification.permission === "granted") {
          new Notification("⏰ Task hết hạn", { body: t.text });
        }
        t.notified = true;
      }
    }
  });

  renderTasks();
}, 1000);

if ("Notification" in window) {
  Notification.requestPermission();
}

addBtn.onclick = addTask;
input.addEventListener("keydown", e => e.key === "Enter" && addTask());
searchInput.addEventListener("input", renderTasks);

renderTasks();