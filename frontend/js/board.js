requireAuth();

const params = new URLSearchParams(location.search);
const projectId = params.get("project");
let tasks = [];

async function loadBoard() {
  if (!projectId) {
    alert("No project selected");
    location.href = "dashboard.html";
    return;
  }

  try {
    const [pRes, tRes] = await Promise.all([
      fetch(`${API}/projects/${projectId}`, {headers: authHeaders()}),
      fetch(`${API}/tasks/project/${projectId}`, {headers: authHeaders()})
    ]);

    if (pRes.status === 401 || tRes.status === 401) return logout();

    const project = await pRes.json();
    tasks = await tRes.json();

    document.getElementById("boardTitle").textContent = project.project_name;
    document.getElementById("boardDescription").textContent = project.description || "";

    renderTasks();
  } catch (err) {
    console.error(err);
    alert("Cannot load project.");
  }
}

function renderTasks() {
  const columns = {
    "To Do": document.getElementById("todoList"),
    "In Progress": document.getElementById("progressList"),
    "Done": document.getElementById("doneList")
  };

  Object.values(columns).forEach(c => c.innerHTML = "");

  const counts = {"To Do":0,"In Progress":0,"Done":0};

  tasks.forEach(task => {
    counts[task.status]++;
    const card = document.createElement("article");
    card.className = "task-card";
    card.innerHTML = `
      <div class="task-top">
        <h4>${escapeHtml(task.title)}</h4>
        <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      <p>${escapeHtml(task.description || "No description")}</p>
      <small class="muted">
        ${task.assigned_name ? `Assigned: ${escapeHtml(task.assigned_name)}` : "Unassigned"}
        ${task.due_date ? ` • Due: ${String(task.due_date).slice(0,10)}` : ""}
      </small>
      <div class="task-footer">
        <select onchange="changeStatus(${task.id}, this.value)">
          <option ${task.status==="To Do"?"selected":""}>To Do</option>
          <option ${task.status==="In Progress"?"selected":""}>In Progress</option>
          <option ${task.status==="Done"?"selected":""}>Done</option>
        </select>
        <div class="task-actions">
          <button onclick="editTask(${task.id})">Edit</button>
          <button onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `;
    columns[task.status].appendChild(card);
  });

  document.getElementById("todoCount").textContent = counts["To Do"];
  document.getElementById("progressCount").textContent = counts["In Progress"];
  document.getElementById("doneCount").textContent = counts["Done"];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function openTaskModal() {
  document.getElementById("taskId").value = "";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskStatus").value = "To Do";
  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskAssignee").value = "";
  document.getElementById("taskDueDate").value = "";
  document.getElementById("taskModalTitle").textContent = "New Task";
  document.getElementById("taskModal").classList.remove("hidden");
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function editTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  document.getElementById("taskId").value = t.id;
  document.getElementById("taskTitle").value = t.title;
  document.getElementById("taskDescription").value = t.description || "";
  document.getElementById("taskStatus").value = t.status;
  document.getElementById("taskPriority").value = t.priority;
  document.getElementById("taskAssignee").value = t.assigned_to || "";
  document.getElementById("taskDueDate").value = t.due_date ? String(t.due_date).slice(0,10) : "";
  document.getElementById("taskModalTitle").textContent = "Edit Task";
  document.getElementById("taskModal").classList.remove("hidden");
}

document.getElementById("taskForm").addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("taskId").value;
  const body = {
    project_id: Number(projectId),
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDescription").value,
    status: document.getElementById("taskStatus").value,
    priority: document.getElementById("taskPriority").value,
    assigned_to: document.getElementById("taskAssignee").value || null,
    due_date: document.getElementById("taskDueDate").value || null
  };

  const res = await fetch(
    id ? `${API}/tasks/${id}` : `${API}/tasks`,
    {
      method: id ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    }
  );

  const data = await res.json();
  if (!res.ok) return alert(data.message);

  closeTaskModal();
  loadBoard();
});

async function changeStatus(id, status) {
  const res = await fetch(`${API}/tasks/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({status})
  });

  if (!res.ok) {
    const data = await res.json();
    return alert(data.message);
  }

  loadBoard();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  const res = await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message);
  loadBoard();
}

loadBoard();
