import { PrismaClient, Purchase } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Types from "@/types";

const prisma = new PrismaClient();

async function updateLogbookOverview(
  response: Response,
  logbookId: number,
  income: number,
  savings: number
) {
  try {
    const logbookOverview = await prisma.overview.update({
      where: { logbookId },
      data: { income, savings },
    });
    return logbookOverview;
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error updating income and savings. Please make sure you've properly filled in the required fields.",
        })
      );
  }
}

async function createOverviewEntryPurchases(
  response: Response,
  name: "recurring" | "incoming",
  overviewEntryId: number,
  purchases: Purchase[]
) {
  try {
    await prisma.purchase.createMany({
      data: purchases,
      skipDuplicates: true,
    });
    const overviewEntryPurchases = await prisma.purchase.findMany({
      where: { entryId: overviewEntryId },
    });
    return overviewEntryPurchases;
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: `There was an error creating ${name} overview entry purchases. Please make sure you've properly filled in the required fields.`,
        })
      );
  }
}

async function updateEntryTotalSpent(
  response: Response,
  name: "recurring" | "incoming",
  entryId: number,
  totalSpent: number
) {
  try {
    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: { totalSpent },
    });
    return updatedEntry;
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: `There was an error creating ${name} overview entry total spent. Please make sure you've properly filled in the required fields.`,
        })
      );
  }
}

export async function onboardNewUser(
  response: Response,
  userId: number,
  logbookId: number,
  income: number,
  savings: number,
  recurringPurchases: Purchase[],
  incomingPurchases: Purchase[],
  recurringEntry: Types.OverviewEntry,
  incomingEntry: Types.OverviewEntry
) {
  try {
    const logbookOverview = await updateLogbookOverview(
      response,
      logbookId,
      income,
      savings
    );

    const overviewRecurringPurchases = await createOverviewEntryPurchases(
      response,
      "recurring",
      recurringEntry.id,
      recurringPurchases
    );

    const overviewIncomingPurchases = await createOverviewEntryPurchases(
      response,
      "incoming",
      incomingEntry.id,
      incomingPurchases
    );

    const updatedRecurringEntry = await updateEntryTotalSpent(
      response,
      "recurring",
      recurringEntry.id,
      recurringEntry.totalCost
    );

    const updatedIncomingEntry = await updateEntryTotalSpent(
      response,
      "incoming",
      incomingEntry.id,
      incomingEntry.totalCost
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { onboarded: true },
    });
    const onboardedUser = Helpers.generateSafeUser(updatedUser);

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        title: "Onboarding completed!",
        body: "Thank you for taking the time to fill out everything until now. Please read the final details and proceed at your convenience.",
        response: {
          logbookOverview,
          overviewRecurringPurchases,
          overviewIncomingPurchases,
          updatedRecurringEntry,
          updatedIncomingEntry,
          onboardedUser,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error onboarding your account. Please refresh the page and try again.",
        })
      );
  }
}
