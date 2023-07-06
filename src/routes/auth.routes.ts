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

const requiredVerificationCodeData: Validators.RequiredVerificationCodeData = [
  "email",
  "verificationCode",
];

authRouter.post(
  "/verify-registration",
  Middleware.validateClientData({
    requiredData: requiredVerificationCodeData,
  }),
  Middleware.checkEmailVerified,
  Middleware.checkSubmittedVerificationCode,
  Controllers.verifyRegistration
);

authRouter.post("/login");

authRouter.post(
  "/verify-login",
  Middleware.validateClientData({
    requiredData: requiredVerificationCodeData,
  }),
  Middleware.checkSubmittedVerificationCode,
  Controllers.verifyRegistration
);

authRouter.post(
  "/send-new-verification-code",
  Middleware.validateClientData({ requiredData: ["email"] }),
  Controllers.sendNewVerificationCode
);
