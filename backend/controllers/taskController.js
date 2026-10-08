const db = require("../config/db");

async function ensureProjectOwner(projectId, userId) {
  const [rows] = await db.execute(
    "SELECT id FROM projects WHERE id = ? AND created_by = ?",
    [projectId, userId]
  );
  return rows.length > 0;
}

async function getTasks(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT t.*, u.name AS assigned_name
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE p.created_by = ?
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getProjectTasks(req, res) {
  try {
    if (!(await ensureProjectOwner(req.params.id, req.user.id))) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [rows] = await db.execute(`
      SELECT t.*, u.name AS assigned_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ?
      ORDER BY t.created_at DESC
    `, [req.params.id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function createTask(req, res) {
  try {
    const {
      project_id, title, description, status = "To Do",
      priority = "Medium", assigned_to = null, due_date = null
    } = req.body;

    if (!project_id || !title?.trim()) {
      return res.status(400).json({ message: "Project and title are required" });
    }

    if (!(await ensureProjectOwner(project_id, req.user.id))) {
      return res.status(403).json({ message: "You do not own this project" });
    }

    const [result] = await db.execute(`
      INSERT INTO tasks
      (project_id, title, description, status, priority, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      project_id, title.trim(), description || "", status, priority,
      assigned_to || null, due_date || null
    ]);

    res.status(201).json({ message: "Task created", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateTask(req, res) {
  try {
    const {
      title, description, status, priority, assigned_to, due_date
    } = req.body;

    const [result] = await db.execute(`
      UPDATE tasks t
      JOIN projects p ON p.id = t.project_id
      SET t.title = ?, t.description = ?, t.status = ?, t.priority = ?,
          t.assigned_to = ?, t.due_date = ?
      WHERE t.id = ? AND p.created_by = ?
    `, [
      title, description || "", status, priority,
      assigned_to || null, due_date || null, req.params.id, req.user.id
    ]);

    if (!result.affectedRows) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { status } = req.body;

    const [result] = await db.execute(`
      UPDATE tasks t
      JOIN projects p ON p.id = t.project_id
      SET t.status = ?
      WHERE t.id = ? AND p.created_by = ?
    `, [status, req.params.id, req.user.id]);

    if (!result.affectedRows) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteTask(req, res) {
  try {
    const [result] = await db.execute(`
      DELETE t FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.id = ? AND p.created_by = ?
    `, [req.params.id, req.user.id]);

    if (!result.affectedRows) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getTasks,
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
