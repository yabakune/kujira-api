import { PrismaClient } from "@prisma/client";
import { Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function getEntries(response: Response) {
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

export async function getEntry(response: Response, entryId: number) {
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

    const entry = await prisma.entry.create({ data });

    return response
      .status(Constants.HttpStatusCodes.CREATED)
      .json(
        Helpers.generateResponse({ body: "Created entry!", response: entry })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to create entry." + Constants.Errors.CREATE_ERROR,
      })
    );
  }
}

export async function updateEntry(
  response: Response,
  entryId: number,
  name?: string,
  totalSpent?: number,
  budget?: number | null,
  overviewId?: number | null,
  logbookId?: number | null
) {
  try {
    const data: Validators.EntryUpdateValidator = {
      name,
      totalSpent,
      budget,
      overviewId,
      logbookId,
    };

    const entry = await prisma.entry.update({ where: { id: entryId }, data });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({ body: "Updated entry!", response: entry })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json({
      body: Constants.Errors.ENTRY_DOES_NOT_EXIST,
    });
  }
}

export async function deleteEntry(response: Response, entryId: number) {
  try {
    const { id } = await prisma.entry.delete({ where: { id: entryId } });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateResponse({ body: "Deleted entry!", response: id }));
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ENTRY_DOES_NOT_EXIST,
      })
    );
  }
}
