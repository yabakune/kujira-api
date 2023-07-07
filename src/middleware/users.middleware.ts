import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Types from "@/types";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

function handleCorrectPasswordValidation(
  request: Request<{ userId: string }, {}, Validators.UpdatePasswordValidator> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction,
  suppliedPassword: string,
  user: User
) {
  try {
    const userSuppliedTheCorrectPassword = bcrypt.compareSync(
      suppliedPassword,
      user.password
    );

    if (userSuppliedTheCorrectPassword) {
      request.attachedUserFromPreviousMiddleware = user;
      return next();
    } else {
      throw new Error();
    }
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Incorrect old password. Please try again."
        )
      );
  }
}

export async function validateCorrectOldPassword(
  request: Request<{ userId: string }, {}, Validators.UpdatePasswordValidator> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
    });

    return handleCorrectPasswordValidation(
      request,
      response,
      next,
      request.body.oldPassword,
      user
    );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}

function handleNewPasswordValidation(
  response: Response,
  next: NextFunction,
  newPassword: string,
  user: User
) {
  try {
    const newPasswordIsTheSameAsThePreviousPassword = bcrypt.compareSync(
      newPassword,
      user.password
    );

    if (newPasswordIsTheSameAsThePreviousPassword) {
      throw new Error();
    } else {
      return next();
    }
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Please enter a unique new password."
        )
      );
  }
}

export async function validateNewPasswordIsNotSameAsPreviousPassword(
  request: Request<{ userId: string }, {}, Validators.UpdatePasswordValidator> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user =
      request.attachedUserFromPreviousMiddleware ||
      (await prisma.user.findUniqueOrThrow({
        where: { id: Number(request.params.userId) },
      }));

    return handleNewPasswordValidation(
      response,
      next,
      request.body.newPassword,
      user
    );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Account does not exist."));
  }
}
