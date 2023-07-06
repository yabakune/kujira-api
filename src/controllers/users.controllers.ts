import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Helpers from "@/helpers";
import * as Services from "@/services";
import { HttpStatusCodes } from "@/utils";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH USERS ] ========================================================================= //
// ========================================================================================= //

export async function getUsers(request: Request, response: Response) {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    const safeUsers = Services.generateSafeUsers(users);
    return response.status(HttpStatusCodes.OK).json({ response: safeUsers });
  } catch (error) {
    return response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "There was an error fetching users. Please refresh the page.",
      caption: "If the problem persists, please email kujira.help@outlook.com",
    });
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
    return response.status(HttpStatusCodes.OK).json({ response: safeUser });
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: Helpers.handleAPIError(error, "User does not exist."),
    });
  }
}
