import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "../constants";
import * as Helpers from "../helpers";
import * as Validators from "../validators";

const prisma = new PrismaClient();

export async function fetchEntries(response: Response) {
  try {
    const entries = await prisma.entry.findMany({ orderBy: { id: "asc" } });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched entries!",
        response: entries,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching entries. Please refresh the page.",
        })
      );
  }
}

export async function fetchEntry(response: Response, entryId: number) {
  try {
    const entry = await prisma.entry.findUniqueOrThrow({
      where: { id: entryId },
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({ body: "Fetched entry!", response: entry })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ENTRY_DOES_NOT_EXIST,
      })
    );
  }
}

export async function fetchOverviewEntries(
  response: Response,
  overviewId: number
) {
  try {
    const overviewEntries = await prisma.entry.findMany({
      where: { overviewId },
      include: {
        purchases: {
          select: { id: true },
          orderBy: { placement: "asc" },
        },
      },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched overview entries!",
        response: overviewEntries,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching entries. Please refresh the page.",
        })
      );
  }
}

export async function fetchLogbookEntries(
  response: Response,
  logbookId: number
) {
  try {
    const logbookEntries = await prisma.entry.findMany({
      where: { logbookId },
      include: {
        purchases: {
          select: { id: true },
          orderBy: { placement: "asc" },
        },
      },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched logbook entries!",
        response: logbookEntries,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching entries. Please refresh the page.",
        })
      );
  }
}

export async function createEntry(
  response: Response,
  name: string,
  overviewId?: number | null,
  logbookId?: number | null
) {
  try {
    const data: Validators.RequiredEntryCreateValidator &
      Validators.OptionalEntryCreateValidator = {
      name,
      overviewId,
      logbookId,
    };

    const entry = await prisma.entry.create({
      data,
      include: {
        purchases: {
          select: { id: true },
          orderBy: { placement: "asc" },
        },
      },
    });

    await prisma.purchase.create({
      data: { entryId: entry.id },
    });

    return response
      .status(Constants.HttpStatusCodes.CREATED)
      .json(
        Helpers.generateResponse({ body: "Created entry!", response: entry })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "There was an error with creating your entry. Please refresh the page and try again.",
      })
    );
  }
}

export async function updateEntry(
  response: Response,
  entryId: number,
  name?: string,
  totalSpent?: number,
  nonMonthlyTotalSpent?: number,
  budget?: number | null,
  overviewId?: number | null,
  logbookId?: number | null
) {
  try {
    const data: Validators.EntryUpdateValidator = {
      name,
      totalSpent,
      nonMonthlyTotalSpent,
      budget,
      overviewId,
      logbookId,
    };

    const entry = await prisma.entry.update({
      data,
      where: { id: entryId },
      include: {
        purchases: {
          select: { id: true },
          orderBy: { placement: "asc" },
        },
      },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Updated entry!",
        response: entry,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json({
      body: "There was an error with updating your entry. Please refresh the page and try again.",
    });
  }
}

export async function deleteEntry(response: Response, entryId: number) {
  try {
    await prisma.entry.delete({ where: { id: entryId } });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({ body: "Deleted entry!", response: entryId })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ENTRY_DOES_NOT_EXIST,
      })
    );
  }
}
