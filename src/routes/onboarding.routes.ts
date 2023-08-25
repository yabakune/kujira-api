import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";

export const onboardingRouter = express.Router();

const requiredOnboardingData = [
  "userId",
  "logbookId",
  "income",
  "savings",
  "recurringPurchases",
  "incomingPurchases",
  "recurringEntry",
  "incomingEntry",
];

onboardingRouter.post(
  "/onboard-new-user",
  Middleware.verifyClientPayload({ requiredData: requiredOnboardingData }),
  Controllers.onboardNewUser
);
