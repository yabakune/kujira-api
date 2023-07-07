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
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Incorrect old password. Please try again.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
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
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
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
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Please enter a unique new password.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
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
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}
