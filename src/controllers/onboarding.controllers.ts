import { Purchase } from "@prisma/client";
import { Request, Response } from "express";

import * as Services from "@/services";
import * as Types from "@/types";

type OnboardingData = {
  userId: number;
  logbookId: number;
  income: number;
  savings: number;
  recurringPurchases: Purchase[];
  incomingPurchases: Purchase[];
  recurringEntry: Types.OverviewEntry;
  incomingEntry: Types.OverviewEntry;
};

export function onboardNewUser(
  request: Request<{}, {}, OnboardingData>,
  response: Response
) {
  return Services.onboardNewUser(
    response,
    request.body.userId,
    request.body.logbookId,
    request.body.income,
    request.body.savings,
    request.body.recurringPurchases,
    request.body.incomingPurchases,
    request.body.recurringEntry,
    request.body.incomingEntry
  );
}
