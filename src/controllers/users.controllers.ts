import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH All USERS ] ========================================================================= //
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
// [ FETCH A USER ] ========================================================================== //
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

// ========================================================================================= //
// [ UPDATE A USER ] =================================================================== //
// ========================================================================================= //

export async function updateUser(
  request: Request<{ userId: string }, {}, Validators.UserUpdateValidator>,
  response: Response
) {
  try {
    const data: Validators.UserUpdateValidator = {
      email: request.body.email,
      username: request.body.username,
      currency: request.body.currency,
      theme: request.body.theme,
      mobileNumber: request.body.mobileNumber,
      emailVerified: request.body.emailVerified,
      onboarded: request.body.onboarded,
    };

    const updatedUser = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data,
    });
    const safeUser = Services.generateSafeUser(updatedUser);

    return response.status(Constants.HttpStatusCodes.OK).json({
      response: safeUser,
      success: "Account updated!",
    });
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S PASSWORD ] =================================================================== //
// ========================================================================================= //

export async function updateUserPassword(
  request: Request<{ userId: string }, {}, { newPassword: string }>,
  response: Response
) {
  try {
    // TODO : There should be a middleware that first checks to make sure that:
    // 				1. The user entered the correct old password.
    // 				2. The user entered a new password that isn't the same as the old password.

    const encryptedPassword = await Helpers.encryptPassword(
      request.body.newPassword
    );
    const data: Validators.UserUpdatePasswordValidator = {
      password: encryptedPassword,
    };
    await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data,
    });

    return response.status(Constants.HttpStatusCodes.OK).json({
      success: "Password updated!",
    });
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}
