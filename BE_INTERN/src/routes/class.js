const express = require("express");

const ClassController = require("../controllers/class");



const classRouter = express.Router();

classRouter.get("/", ClassController.getClass);
classRouter.get("/:id", ClassController.getClassById);


module.exports = classRouter;
