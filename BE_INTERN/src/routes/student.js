const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const StudentController = require("../controllers/student");



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const studentRouter = express.Router();

studentRouter.get("/", StudentController.getStudents);
studentRouter.get("/:id", StudentController.getStudent);
studentRouter.post("/search", StudentController.searchStudents);
studentRouter.post("/", StudentController.createStudent);
studentRouter.patch("/:id", StudentController.updateStudent);
studentRouter.delete("/:id", StudentController.deleteStudent);
studentRouter.post("/delete", StudentController.deleteStudents);
studentRouter.post("/copy", StudentController.copyStudent);
studentRouter.post("/import", upload.single("file"), StudentController.importStudents);
studentRouter.post("/export", StudentController.exportStudentsByIds);

module.exports = studentRouter;
