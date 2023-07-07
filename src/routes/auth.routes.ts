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
  Middleware.verifyClientPayload({ requiredData: RequiredRegistrationData }),
  Controllers.register
);

const requiredVerificationCodeData: Validators.RequiredVerificationCodeData = [
  "email",
  "verificationCode",
];

authRouter.post(
  "/verify-registration",
  Middleware.verifyClientPayload({
    requiredData: requiredVerificationCodeData,
  }),
  Middleware.validateEmailVerified,
  Middleware.validateSubmittedVerificationCode,
  Controllers.verifyRegistration
);

const requiredLoginData: Validators.RequiredLoginData = ["email", "password"];
authRouter.post(
  "/login",
  Middleware.verifyClientPayload({ requiredData: requiredLoginData }),
  Middleware.validateUserExists,
  Middleware.validateUserEnteredCorrectPassword,
  Controllers.login
);

authRouter.post(
  "/verify-login",
  Middleware.verifyClientPayload({
    requiredData: requiredVerificationCodeData,
    optionalData: ["thirtyDays"],
  }),
  Middleware.validateSubmittedVerificationCode,
  Controllers.verifyLogin
);

authRouter.post(
  "/send-new-verification-code",
  Middleware.verifyClientPayload({ requiredData: ["email"] }),
  Controllers.sendNewVerificationCode
);
