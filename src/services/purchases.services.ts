import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function fetchPurchases(response: Response) {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { id: "asc" },
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
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
