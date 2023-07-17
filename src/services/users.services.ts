import { Currency, PrismaClient, Theme, User } from "@prisma/client";
import { Response } from "express";

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
  return excludeFieldFromUsersObject(users, [
    "password",
    "accessToken",
    "verificationCode",
  ]);
}

export async function fetchUsers(response: Response) {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    const safeUsers = generateSafeUsers(users);

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched accounts!",
        response: safeUsers,
      })
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error fetching accounts. Please refresh the page.",
        })
      );
  }
}

export async function fetchUser(response: Response, userId: number) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const safeUser = Helpers.generateSafeUser(user);

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Fetched account!",
        response: safeUser,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
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
    const safeUser = Helpers.generateSafeUser(updatedUser);

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Updated account!",
        response: safeUser,
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.generateUpdateError("user"),
      })
    );
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
      .json(Helpers.generateResponse({ body: "Updated password!" }));
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: "Failed to update password. Please try again.",
      })
    );
  }
}

export async function deleteUser(response: Response, userId: number) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateResponse({ body: "Deleted account!", response: userId })
      );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}
