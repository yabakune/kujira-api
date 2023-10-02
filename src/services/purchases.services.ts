import { Category, PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "../constants";
import * as Helpers from "../helpers";
import * as Validators from "../validators";

const prisma = new PrismaClient();

export async function fetchPurchases(response: Response) {
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

export async function fetchPurchase(response: Response, purchaseId: number) {
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

export async function fetchEntryPurchases(response: Response, entryId: number) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { entryId },
      orderBy: { placement: "asc" },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched purchases!",
        response: purchases,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: "There was an error fetching entry purchases. Chances are, the entry does not exist. Please refresh the page and try again.",
      })
    );
  }
}

export async function createPurchase(
  response: Response,
  entryId: number,
  category?: Category | null,
  description?: string,
  cost?: number | null
) {
  try {
    const { purchases } = await prisma.entry.findUniqueOrThrow({
      where: { id: entryId },
      include: {
        purchases: {
          take: 1,
          orderBy: { placement: "desc" },
          select: { placement: true },
        },
      },
    });

    const data: Validators.RequiredPurchaseCreateValidator &
      Validators.OptionalPurchaseCreateValidator = {
      placement: purchases.length > 0 ? purchases[0].placement + 1 : 1,
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
        body: "Failed to create purchase. " + Constants.Errors.CREATE_ERROR,
      })
    );
  }
}

export async function updatePurchase(
  response: Response,
  purchaseId: number,
  placement?: number,
  category?: Category | null,
  description?: string,
  cost?: number | null
) {
  try {
    const data: Validators.OptionalPurchaseUpdateValidator = {
      placement,
      category,
      description,
      cost,
    };
    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data,
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Updated purchase!",
        response: purchase,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: Constants.generateUpdateError("purchase"),
      })
    );
  }
}

export async function deletePurchase(response: Response, purchaseId: number) {
  try {
    await prisma.purchase.delete({ where: { id: purchaseId } });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Deleted purchase!",
        response: purchaseId,
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

export async function bulkDeletePurchases(
  response: Response,
  purchaseIds: number[]
) {
  try {
    if (purchaseIds.length < 2) {
      throw new Error();
    } else {
      const { count } = await prisma.purchase.deleteMany({
        where: { id: { in: purchaseIds } },
      });

      return response.status(Constants.HttpStatusCodes.OK).json(
        Helpers.generateResponse({
          body: `Deleted ${count} purchases!`,
          response: purchaseIds,
        })
      );
    }
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "Failed to delete purchases. Either select more than one purchase or refresh the page and try again.",
        })
      );
  }
}

export async function deleteEntryPurchases(
  response: Response,
  entryId: number
) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { entryId },
      select: { id: true },
    });
    const deletedPurchaseIds = purchases.map((purchase: { id: number }) => {
      return purchase.id;
    });

    const { count } = await prisma.purchase.deleteMany({
      where: { entryId },
    });

    return response.status(Constants.HttpStatusCodes.OK).json({
      body: `Deleted ${count} purchases!`,
      response: deletedPurchaseIds,
    });
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateResponse({
        body: "Failed to delete all purchases. Please refresh the page and try again.",
      })
    );
  }
}
