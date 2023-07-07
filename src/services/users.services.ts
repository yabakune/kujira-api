import { Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";

const prisma = new PrismaClient();

function excludeFieldFromUsersObject<User, Field extends keyof User>(
  users: User[],
  fields: Field[]
): Omit<User[], Field> {
  users.forEach((user: User) => {
    for (let field of fields) delete user[field];
  });
  return users;
}
export function generateSafeUsers(users: User[]) {
  return excludeFieldFromUsersObject(users, ["password", "verificationCode"]);
}

function excludeFieldFromUserObject<User, Field extends keyof User>(
  user: User,
  fields: Field[]
): Omit<User, Field> {
  for (let field of fields) delete user[field];
  return user;
}
export function generateSafeUser(user: User) {
  return excludeFieldFromUserObject(user, ["password", "verificationCode"]);
}

export async function fetchAllUsers(response: Response) {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    const safeUsers = generateSafeUsers(users);

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateDataResponse(safeUsers));
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

export async function fetchOneUser(response: Response, userId: number) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const safeUser = generateSafeUser(user);

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateDataResponse(safeUser));
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}
