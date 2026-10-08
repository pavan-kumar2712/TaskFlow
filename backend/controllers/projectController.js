const db = require("../config/db");

async function getProjects(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT p.id, p.project_name, p.description, p.created_at,
             COUNT(t.id) AS task_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.created_by = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getProject(req, res) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM projects WHERE id = ? AND created_by = ?",
      [req.params.id, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Project not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function createProject(req, res) {
  try {
    const { project_name, description } = req.body;
    if (!project_name?.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const [result] = await db.execute(
      "INSERT INTO projects (project_name, description, created_by) VALUES (?, ?, ?)",
      [project_name.trim(), description || "", req.user.id]
    );

    res.status(201).json({
      message: "Project created",
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateProject(req, res) {
  try {
    const { project_name, description } = req.body;

    const [result] = await db.execute(
      "UPDATE projects SET project_name = ?, description = ? WHERE id = ? AND created_by = ?",
      [project_name, description || "", req.params.id, req.user.id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteProject(req, res) {
  try {
    const [result] = await db.execute(
      "DELETE FROM projects WHERE id = ? AND created_by = ?",
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
