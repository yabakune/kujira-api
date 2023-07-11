import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function getPurchases(response: Response) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched purchases!",
        response: purchases,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching purchases. Please refresh the page.",
        })
      );
  }
}

export async function getPurchase(response: Response, purchaseId: number) {
  try {
    const purchase = await prisma.purchase.findUniqueOrThrow({
      where: { id: purchaseId },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched purchase!",
        response: purchase,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.PURCHASE_DOES_NOT_EXIST,
      })
    );
  }
}
