import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function getOverviews(response: Response) {
  try {
    const overviews = await prisma.overview.findMany({
      orderBy: { id: "asc" },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched overviews!",
        response: overviews,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching overviews. Please refresh the page.",
        })
      );
  }
}

export async function getOverview(response: Response, overviewId: number) {
  try {
    const overview = await prisma.overview.findUniqueOrThrow({
      where: { id: overviewId },
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({
          body: "Fetched overview!",
          response: overview,
        })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json({
      body: Constants.Errors.OVERVIEW_DOES_NOT_EXIST,
    });
  }
}

export async function createOverview(
  response: Response,
  income: number,
  savings: number = 0,
  ownerId: number
) {
  try {
    const data: Validators.OverviewCreateValidator = {
      income,
      savings,
      ownerId,
    };

    const overview = await prisma.overview.create({ data });

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateResponse({
        body: "Created overview!",
        response: overview,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json({
      response: "Failed to create overview." + Constants.Errors.CREATE_ERROR,
    });
  }
}

export async function updateOverview(
  response: Response,
  overviewId: number,
  income?: number,
  savings?: number
) {
  try {
    const data: Validators.OverviewUpdateValidator = {
      income,
      savings,
    };

    const updatedOverview = await prisma.overview.update({
      where: { id: overviewId },
      data,
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Updated overview!",
        response: updatedOverview,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.OVERVIEW_DOES_NOT_EXIST,
      })
    );
  }
}

export async function deleteOverview(response: Response, overviewId: number) {
  try {
    const { id } = await prisma.overview.delete({ where: { id: overviewId } });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({ body: "Deleted overview!", response: id })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.OVERVIEW_DOES_NOT_EXIST,
      })
    );
  }
}
