import { Category, PrismaClient } from "@prisma/client";
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

export async function createPurchase(
  response: Response,
  category: Category,
  entryId: number,
  description?: string,
  cost?: number | null
) {
  try {
    const data: Validators.RequiredPurchaseCreateValidator &
      Validators.OptionalPurchaseCreateValidator = {
      category,
      entryId,
      description,
      cost,
    };
    const purchase = await prisma.purchase.create({ data });

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateResponse({
        body: "Created purchase!",
        response: purchase,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to create purchase." + Constants.Errors.CREATE_ERROR,
      })
    );
  }
}

export async function updatePurchase(
  response: Response,
  purchaseId: number,
  category?: Category,
  description?: string,
  cost?: number | null
) {
  try {
    const data: Validators.OptionalPurchaseUpdateValidator = {
      category,
      description,
      cost,
    };
    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data,
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({
          body: "Updated purchase!",
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