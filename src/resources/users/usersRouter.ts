import express from "express";
import usersController from "./usersController";
const usersRouter = express.Router();

usersRouter.route("/").post(usersController.create);

export default usersRouter;
