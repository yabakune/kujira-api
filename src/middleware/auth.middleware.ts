import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

type AttachedUserFromPreviousMiddleware = {
  attachedUserFromPreviousMiddleware?: User;
};

export async function checkEmailVerified(
  request: Request<{}, {}, { email: string }> &
    AttachedUserFromPreviousMiddleware,
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
      // ↓↓↓ Adding our found user to the middleware chain so we don't have to search for it with every step. ↓↓↓ //
      request.attachedUserFromPreviousMiddleware = user;
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

export async function checkUserExists(
  request: Request<{}, {}, { email: string }> &
    AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });
    request.attachedUserFromPreviousMiddleware = user;
    return next();
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "A user with that email doesn't exist"
        )
      );
  }
}

export async function checkUserEnteredCorrectPassword(
  request: Request<{}, {}, Validators.LoginValidator> &
    AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user =
      request.attachedUserFromPreviousMiddleware ||
      (await prisma.user.findUniqueOrThrow({
        where: { email: request.body.email },
      }));
    const passwordsMatch = bcrypt.compareSync(
      request.body.password,
      user.password
    );

    if (passwordsMatch) {
      return next();
    } else {
      return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
        Helpers.generateTextResponse({
          body: "Password incorrect. Please enter the correct password",
        })
      );
    }
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}

function checkJWTExpired(jsonWebToken: string, secretKey: string): boolean {
  let isExpired = false;
  jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
    if (error) isExpired = true;
  });
  return isExpired;
}

export async function checkSubmittedVerificationCode(
  request: Request<{}, {}, Validators.VerificationCodeValidator> &
    AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user =
      request.attachedUserFromPreviousMiddleware ||
      (await prisma.user.findUniqueOrThrow({
        where: { email: request.body.email },
      }));

    if (!user.verificationCode) {
      return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
        Helpers.generateTextResponse({
          title: "Account does not have a verification code.",
          body: "Please log in or request a new verification code.",
        })
      );
    } else {
      const secretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
      if (!secretKey) {
        throw new Error();
      } else if (checkJWTExpired(user.verificationCode, secretKey)) {
        return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
          Helpers.generateTextResponse({
            body: "Verification code expired. Please request a new verification code.",
          })
        );
      } else if (
        Services.decodeVerificationCode(user.verificationCode, secretKey) !==
        request.body.verificationCode
      ) {
        return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
          Helpers.generateTextResponse({
            body: "Invalid verification code. Please supply the correct code.",
          })
        );
      } else {
        return next();
      }
    }
  } catch (error) {
    console.log(
      "VERIFICATION_CODE_SECRET_KEY environment variable MAY not exist."
    );
    console.log("checkSubmittedVerificationCode() Error:", error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(Helpers.generateErrorResponse(error));
  }
}
