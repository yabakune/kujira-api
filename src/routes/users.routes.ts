import express from "express";

import * as Controllers from "@/controllers/users.controllers";

export const usersRouter = express.Router();

usersRouter.get("/", Controllers.getUsers);
