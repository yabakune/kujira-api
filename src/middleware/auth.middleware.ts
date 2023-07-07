import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Types from "@/types";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

export async function validateAccountDoesNotExist(
  request: Request<{}, {}, { email: string }>,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: request.body.email },
    });

    if (user) {
      throw new Error();
    } else {
      return next();
    }
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: Constants.Errors.ACCOUNT_ALREADY_EXISTS,
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

export async function validateAccountExists(
  request: Request<{}, {}, { email: string }> &
    Types.AttachedUserFromPreviousMiddleware,
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
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

export async function validateUserEnteredCorrectPassword(
  request: Request<{}, {}, Validators.LoginValidator> &
    Types.AttachedUserFromPreviousMiddleware,
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

    if (passwordsMatch) return next();
    else throw new Error();
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Incorrect password. Please enter the correct password",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

// ========================================================================================= //
// [ VALIDATING WHETHER THE USER ALREADY HAS A VERIFIED EMAIL ] ============================ //
// ========================================================================================= //

function handleEmailCheck(
  request: Request<{}, {}, { email: string }> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction,
  user: User
) {
  try {
    if (user.emailVerified) {
      throw new Error();
    } else {
      request.attachedUserFromPreviousMiddleware = user;
      return next();
    }
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: `Email ${request.body.email} is already verified. Please log in.`,
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

export async function validateEmailVerified(
  request: Request<{}, {}, { email: string }> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: request.body.email },
    });

    return handleEmailCheck(request, response, next, user);
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

// ========================================================================================= //
// [ VALIDATING IF...  ] =================================================================== //
// [ 1. THE USER HAS A VERIFICATION CODE IN THE FIRST PLACE.  ] ============================ //
// [ 2. CHECKING IF THEIR VERIFICATION CODE HAS EXPIRED.      ] ============================ //
// [ 3. CHECKING IF THE USER SUPPLIED THE CORRECT CODE.       ] ============================ //
// ========================================================================================= //

function checkIfUserProvidedIncorrectVerificationCode(
  response: Response,
  next: NextFunction,
  secretKey: string,
  verificationCodeInDatabase: string,
  verificationCodeProvidedByClient: string
) {
  try {
    const userProvidedIncorrectVerificationCode =
      Services.decodeVerificationCode(verificationCodeInDatabase, secretKey) !==
      verificationCodeProvidedByClient;

    if (userProvidedIncorrectVerificationCode) throw new Error();
    else return next();
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Invalid verification code. Please supply the correct code.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

function checkJWTExpired(jsonWebToken: string, secretKey: string): boolean {
  let isExpired = false;
  jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
    if (error) isExpired = true;
  });
  return isExpired;
}

function checkIfVerificationCodeHasExpired(
  response: Response,
  next: NextFunction,
  secretKey: string,
  verificationCodeInDatabase: string,
  verificationCodeProvidedByClient: string
) {
  try {
    const verificationCodeHasExpired = checkJWTExpired(
      verificationCodeInDatabase,
      secretKey
    );

    if (verificationCodeHasExpired) {
      throw new Error();
    } else {
      return checkIfUserProvidedIncorrectVerificationCode(
        response,
        next,
        secretKey,
        verificationCodeInDatabase,
        verificationCodeProvidedByClient
      );
    }
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Verification code expired. Please request a new verification code.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

function checkVerificationCodeEnvironmentVariableExists(
  request: Request,
  response: Response,
  next: NextFunction,
  verificationCodeInDatabase: string
) {
  try {
    const secretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
    if (!secretKey) {
      throw new Error();
    } else {
      return checkIfVerificationCodeHasExpired(
        response,
        next,
        secretKey,
        verificationCodeInDatabase,
        request.body.verificationCode
      );
    }
  } catch (error) {
    console.error(Constants.Errors.VERIFICATION_CODE_SECRET_KEY_DOES_NOT_EXIST);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateResponse({
          body: "There was an error with validating your verification code.",
          caption: Constants.Errors.CONTACT_EMAIL,
        })
      );
  }
}

function checkIfUserHasVerificationCode(
  request: Request<{}, {}, Validators.VerificationCodeValidator> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction,
  user: User
) {
  try {
    if (!user.verificationCode) {
      throw new Error();
    } else {
      return checkVerificationCodeEnvironmentVariableExists(
        request,
        response,
        next,
        user.verificationCode
      );
    }
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Account does not have a verification code. Please log in or request a new verification code.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}

export async function validateVerificationCode(
  request: Request<{}, {}, Validators.VerificationCodeValidator> &
    Types.AttachedUserFromPreviousMiddleware,
  response: Response,
  next: NextFunction
) {
  try {
    const user =
      request.attachedUserFromPreviousMiddleware ||
      (await prisma.user.findUniqueOrThrow({
        where: { email: request.body.email },
      }));

    return checkIfUserHasVerificationCode(request, response, next, user);
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateResponse({
        body: "Failed to validate verification code. Please try again.",
        caption: Constants.Errors.CONTACT_EMAIL,
      })
    );
  }
}
