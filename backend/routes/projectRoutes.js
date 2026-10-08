const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  getProjects, getProject, createProject, updateProject, deleteProject
} = require("../controllers/projectController");

const router = express.Router();

router.use(auth);
router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
