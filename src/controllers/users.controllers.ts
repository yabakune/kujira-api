import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH USERS ] ========================================================================= //
// ========================================================================================= //

export async function getUsers(request: Request, response: Response) {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    const safeUsers = Services.generateSafeUsers(users);
    return response
      .status(Constants.HttpStatusCodes.OK)
      .json({ response: safeUsers });
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse(
          error,
          "There was an error fetching users. Please refresh the page."
        )
      );
  }
}

// ========================================================================================= //
// [ FETCH USER ] ========================================================================== //
// ========================================================================================= //

export async function getUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });
    const safeUser = Services.generateSafeUser(user);
    return response
      .status(Constants.HttpStatusCodes.OK)
      .json({ response: safeUser });
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}
