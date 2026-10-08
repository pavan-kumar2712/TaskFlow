requireAuth();

const user = getUser();
const welcome = document.getElementById("welcomeUser");
if (welcome) welcome.textContent = `Hi, ${user.name || "User"}`;

let projects = [];

async function loadDashboard() {
  try {
    const [pRes, tRes] = await Promise.all([
      fetch(`${API}/projects`, {headers: authHeaders()}),
      fetch(`${API}/tasks`, {headers: authHeaders()})
    ]);

    if (pRes.status === 401 || tRes.status === 401) return logout();

    projects = await pRes.json();
    const tasks = await tRes.json();

    document.getElementById("projectCount").textContent = projects.length;
    document.getElementById("taskCount").textContent = tasks.length;
    document.getElementById("doneCount").textContent = tasks.filter(t => t.status === "Done").length;
    document.getElementById("progressCount").textContent = tasks.filter(t => t.status === "In Progress").length;

    const grid = document.getElementById("projectsGrid");
    const empty = document.getElementById("emptyProjects");

    grid.innerHTML = "";
    empty.classList.toggle("hidden", projects.length > 0);

    projects.forEach(p => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.innerHTML = `
        <h3>${escapeHtml(p.project_name)}</h3>
        <p>${escapeHtml(p.description || "No description")}</p>
        <div class="project-meta">
          <span>${p.task_count} task(s)</span>
        </div>
        <button class="btn primary open-btn" onclick="openBoard(${p.id})">Open Board</button>
        <div class="edit-row">
          <button class="btn ghost" onclick="editProject(${p.id})">Edit</button>
          <button class="btn danger" onclick="deleteProject(${p.id})">Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("Cannot connect to the TaskFlow server.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function openBoard(id) {
  location.href = `board.html?project=${id}`;
}

function openProjectModal() {
  document.getElementById("projectId").value = "";
  document.getElementById("projectName").value = "";
  document.getElementById("projectDescription").value = "";
  document.getElementById("projectModalTitle").textContent = "New Project";
  document.getElementById("projectModal").classList.remove("hidden");
}

function closeProjectModal() {
  document.getElementById("projectModal").classList.add("hidden");
}

function editProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById("projectId").value = p.id;
  document.getElementById("projectName").value = p.project_name;
  document.getElementById("projectDescription").value = p.description || "";
  document.getElementById("projectModalTitle").textContent = "Edit Project";
  document.getElementById("projectModal").classList.remove("hidden");
}

async function deleteProject(id) {
  if (!confirm("Delete this project and all its tasks?")) return;
  const res = await fetch(`${API}/projects/${id}`, {
    method: "DELETE", headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message);
  loadDashboard();
}

document.getElementById("projectForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("projectId").value;
  const body = {
    project_name: document.getElementById("projectName").value,
    description: document.getElementById("projectDescription").value
  };

  const res = await fetch(
    id ? `${API}/projects/${id}` : `${API}/projects`,
    {
      method: id ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    }
  );

  const data = await res.json();
  if (!res.ok) return alert(data.message);
  closeProjectModal();
  loadDashboard();
});

loadDashboard();
