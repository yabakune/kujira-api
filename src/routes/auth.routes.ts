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
  Middleware.verifyClientData({ requiredData: RequiredRegistrationData }),
  Controllers.register
);

const requiredVerificationCodeData: Validators.RequiredVerificationCodeData = [
  "email",
  "verificationCode",
];

authRouter.post(
  "/verify-registration",
  Middleware.verifyClientData({
    requiredData: requiredVerificationCodeData,
  }),
  Middleware.checkEmailVerified,
  Middleware.checkSubmittedVerificationCode,
  Controllers.verifyRegistration
);

const requiredLoginData: Validators.RequiredLoginData = ["email", "password"];
authRouter.post(
  "/login",
  Middleware.verifyClientData({ requiredData: requiredLoginData }),
  Middleware.checkUserExists,
  Middleware.checkUserEnteredCorrectPassword,
  Controllers.login
);

authRouter.post(
  "/verify-login",
  Middleware.verifyClientData({
    requiredData: requiredVerificationCodeData,
    optionalData: ["thirtyDays"],
  }),
  Middleware.checkSubmittedVerificationCode,
  Controllers.verifyLogin
);

authRouter.post(
  "/send-new-verification-code",
  Middleware.verifyClientData({ requiredData: ["email"] }),
  Controllers.sendNewVerificationCode
);