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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "An account with that email already exists."
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "An account with that email doesn't exist."
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Password incorrect. Please enter the correct password"
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Invalid verification code. Please supply the correct code."
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Verification code expired. Please request a new verification code."
        )
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
    console.log(
      "VERIFICATION_CODE_SECRET_KEY environment variable does not exist."
    );
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse(
          error,
          "There was an error with validating your verification code."
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Account does not have a verification code. Please log in or request a new verification code."
        )
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
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}
