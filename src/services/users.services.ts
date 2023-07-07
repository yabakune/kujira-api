import { Response } from "express";
import { Currency, PrismaClient, Theme, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

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
function generateSafeUsers(users: User[]) {
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

export async function getUsers(response: Response) {
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

export async function getUser(response: Response, userId: number) {
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

export async function updateUser(
  response: Response,
  userId: number,
  email?: string,
  username?: string,
  currency?: Currency,
  theme?: Theme,
  mobileNumber?: string | null
) {
  try {
    const data: Validators.UserUpdateValidator = {
      email,
      username,
      currency,
      theme,
      mobileNumber,
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    const safeUser = generateSafeUser(updatedUser);

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateDataResponse(safeUser, "Account updated!"));
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}

export async function updateUserPassword(
  response: Response,
  userId: number,
  newPassword: string
) {
  try {
    const encryptedPassword = await Helpers.encryptPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: encryptedPassword },
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateDataResponse(null, "Password updated!"));
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}

export async function deleteUser(response: Response, userId: number) {
  try {
    const { id } = await prisma.user.delete({
      where: { id: userId },
    });
    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateDataResponse(id, "Account deleted!"));
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}
