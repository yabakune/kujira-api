import express from "express";

import * as Controllers from "@/controllers/auth.controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const authRouter = express.Router();

const RequiredRegistrationData: Validators.RequiredRegistrationData = [
  "email",
  "username",
  "password",
];
authRouter.post(
  "/register",
  Middleware.validateClientData({ requiredData: RequiredRegistrationData }),
  Controllers.register
);

authRouter.post("/verify-registration");

authRouter.post("/:userId/login");

authRouter.post("/:userId/verify-login");

authRouter.post("/resend-verification-code");
