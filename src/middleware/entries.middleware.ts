import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import * as Constants from "../constants";
import * as Helpers from "../helpers";
import * as Validators from "../validators";

const prisma = new PrismaClient();

export async function checkIfEntryWithNameAlreadyExists(
  request: Request<
    {},
    {},
    Validators.RequiredEntryCreateValidator &
      Validators.OptionalEntryCreateValidator
  >,
  response: Response,
  next: NextFunction
) {
  try {
    const { name, overviewId, logbookId } = request.body;

    let entry = null;

    if (overviewId) {
      entry = await prisma.entry.findFirst({ where: { name, overviewId } });
    } else if (logbookId) {
      entry = await prisma.entry.findFirst({ where: { name, logbookId } });
    }

    if (entry) throw new Error();
    else return next();
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: `An entry with name "${request.body.name}" already exists!`,
      })
    );
  }
}
