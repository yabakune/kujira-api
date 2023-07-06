import { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

type UserFromCheckEmailVerified = { userFromCheckEmailVerified?: User };

export async function checkEmailVerified(
  request: Request<{}, {}, { email: string }> & UserFromCheckEmailVerified,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });
    if (user.emailVerified) {
      throw new Error();
    } else {
      request.userFromCheckEmailVerified = user;
      return next();
    }
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          `Email ${request.body.email} is already verified. Please log in.`
        )
      );
  }
}

export async function checkSubmittedVerificationCode(
  request: Request<{}, {}, Validators.VerificationCodeValidator> &
    UserFromCheckEmailVerified,
  response: Response,
  next: NextFunction
) {
  try {
    const user =
      request.userFromCheckEmailVerified ||
      (await prisma.user.findUniqueOrThrow({
        where: { email: request.body.email },
      }));

    if (user.verificationCode === request.body.verificationCode) {
      return next();
    } else {
      request.userFromCheckEmailVerified = user;
      throw new Error();
    }
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error, "Invalid verification code."));
  }
}
