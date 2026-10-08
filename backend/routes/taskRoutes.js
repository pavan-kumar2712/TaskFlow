const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  getTasks, getProjectTasks, createTask,
  updateTask, updateTaskStatus, deleteTask
} = require("../controllers/taskController");

const router = express.Router();

router.use(auth);
router.get("/", getTasks);
router.get("/project/:id", getProjectTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.put("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

module.exports = router;
