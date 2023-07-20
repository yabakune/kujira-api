import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function fetchLogbooks(response: Response) {
  try {
    const logbooks = await prisma.logbook.findMany({ orderBy: { id: "asc" } });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched logbooks!",
        response: logbooks,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching logbooks. Please refresh the page.",
        })
      );
  }
}

export async function fetchLogbook(response: Response, logbookId: number) {
  try {
    const logbook = await prisma.logbook.findUniqueOrThrow({
      where: { id: logbookId },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched logbook!",
        response: logbook,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.LOGBOOK_DOES_NOT_EXIST,
      })
    );
  }
}

export async function fetchUserLogbooks(response: Response, ownerId: number) {
  try {
    const logbooks = await prisma.logbook.findMany({
      where: { ownerId },
      include: {
        overview: { select: { id: true } },
        entries: { select: { id: true } },
      },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched logbooks!",
        response: logbooks,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: "There was a problem with fetching your logbooks. Please refresh the page and try again.",
      })
    );
  }
}

export async function createLogbook(
  response: Response,
  name: string,
  ownerId: number
) {
  try {
    const data: Validators.RequiredLogbookCreateValidator = {
      name,
      ownerId,
    };

    const logbook = await prisma.logbook.create({ data });

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateResponse({
        body: "Created logbook!",
        response: logbook,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to create logbook." + Constants.Errors.CREATE_ERROR,
      })
    );
  }
}

export async function updateLogbook(
  response: Response,
  logbookId: number,
  name?: string
) {
  try {
    const data: Validators.LogbookUpdateValidator = { name };

    const logbook = await prisma.logbook.update({
      where: { id: logbookId },
      data,
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Updated logbook!",
        response: logbook,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.generateUpdateError("logbook"),
      })
    );
  }
}

export async function deleteLogbook(response: Response, logbookId: number) {
  try {
    await prisma.logbook.delete({ where: { id: logbookId } });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Deleted logbook!",
        response: logbookId,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.LOGBOOK_DOES_NOT_EXIST,
      })
    );
  }
}
