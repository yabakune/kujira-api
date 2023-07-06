import express from "express";

import * as Controllers from "@/controllers/users.controllers";

export const usersRouter = express.Router();

usersRouter.get("/", Controllers.getUsers);
usersRouter.get("/:userId", Controllers.getUser);
usersRouter.patch("/:userId", Controllers.updateUser);
usersRouter.patch("/:userId/update-password", Controllers.updateUserPassword);
