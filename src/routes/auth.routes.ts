import express from "express";

import * as Controllers from "@/controllers/auth.controllers";

export const authRouter = express.Router();

authRouter.post("/register", Controllers.register);
authRouter.post("/verify-registration");
authRouter.post("/:userId/login");
authRouter.post("/:userId/verify-login");
authRouter.post("/resend-verification-code");
