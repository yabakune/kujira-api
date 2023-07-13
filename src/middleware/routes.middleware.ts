import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ MAKING SURE THE CLIENT SENT THE CORRECT DATA TO THE API ] ============================= //
// ========================================================================================= //

function generateMissingRequiredData(
  suppliedClientPayload: string[],
  requiredData?: string[]
) {
  if (requiredData) {
    const missingClientData = requiredData.filter(
      (data: string) => !suppliedClientPayload.includes(data)
    );
    return missingClientData;
  } else {
    return [];
  }
}

function throwOnMissingRequiredData(
  response: Response,
  suppliedClientPayload: string[],
  requiredData?: string[]
) {
  try {
    const missingRequiredData = generateMissingRequiredData(
      suppliedClientPayload,
      requiredData
    );

    if (missingRequiredData.length > 0) {
      throw new Error(missingRequiredData.join(", "));
    } else {
      return;
    }
  } catch (error: any) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: `Missing Data: ${error.message}.`,
      })
    );
  }
}

function throwOnUnexpectedPayload(
  response: Response,
  suppliedClientPayload: string[],
  requiredData: string[],
  optionalData: string[]
) {
  const expectedClientPayload = requiredData.concat(optionalData);

  try {
    for (const suppliedPayload of suppliedClientPayload) {
      if (!expectedClientPayload.includes(suppliedPayload)) {
        throw new Error(suppliedPayload);
      }
    }
    return;
  } catch (error: any) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: `Unexpected input: ${error.message}. Please provide the correct details.`,
      })
    );
  }
}

type ExpectedClientPayload = {
  requiredData?: string[];
  optionalData?: string[];
};

export function verifyClientPayload(
  expectedClientPayload: ExpectedClientPayload
) {
  return (request: Request, response: Response, next: NextFunction) => {
    const suppliedClientPayload = Object.keys(request.body); // Data sent from the client.
    const { requiredData, optionalData } = expectedClientPayload;

    throwOnUnexpectedPayload(
      response,
      suppliedClientPayload,
      requiredData || [],
      optionalData || []
    );

    throwOnMissingRequiredData(response, suppliedClientPayload, requiredData);

    return next();
  };
}

// ========================================================================================= //
// [ MIDDLEWARE THAT GATES ACCESS TO ROUTES THAT REQUIRE AUTHORIZED ACCESS ] =============== //
// ========================================================================================= //

type RequestWithUserId = Request<{}, {}, {}, { userId: string }>;
type RequestWithAccessToken = RequestWithUserId & {
  accessToken: string | JwtPayload;
};

async function throwOnExpiredAccessToken(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction,
  authSecretKey: string,
  accessToken: string
) {
  try {
    const accessTokenExpired = Helpers.checkJWTExpired(
      accessToken,
      authSecretKey
    );

    if (accessTokenExpired) {
      await prisma.user.update({
        where: { id: Number(request.query.userId) },
        data: { accessToken: null },
      });
      throw new Error();
    } else {
      const decodedAccessToken = jwt.verify(accessToken, authSecretKey);
      // ↓↓↓ Appending decoded access token to Express's `request` object to use in the action user wanted to perform. ↓↓↓ //
      (request as RequestWithAccessToken).accessToken = decodedAccessToken;
      return next();
    }
  } catch (error) {
    console.error(error, "Access token expired");
    console.error(
      `User with ID ${request.query.userId} has an expired access token. They must log in again.`
    );
    return response.status(Constants.HttpStatusCodes.FORBIDDEN).json(
      Helpers.generateErrorResponse({
        body: "Unauthorized access. Please register or log in.",
      })
    );
  }
}

async function throwOnMissingAccessToken(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction,
  authSecretKey: string
) {
  try {
    // const accessToken = request.header("authorization");
    const { accessToken } = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.query.userId) },
    });

    if (!accessToken) {
      throw new Error();
    } else {
      return throwOnExpiredAccessToken(
        request,
        response,
        next,
        authSecretKey,
        accessToken
      );
    }
  } catch (error) {
    console.error(
      error,
      `User with ID ${request.query.userId} does not have an access token.`
    );
    return response.status(Constants.HttpStatusCodes.FORBIDDEN).json(
      Helpers.generateErrorResponse({
        body: "Important account information no longer exists.",
      })
    );
  }
}

async function throwOnMissingAccount(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction,
  authSecretKey: string
) {
  try {
    await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.query.userId) },
    });
    return throwOnMissingAccessToken(request, response, next, authSecretKey);
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}

function throwOnMissingUserId(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction,
  authSecretKey: string
) {
  try {
    if (!request.query.userId) {
      throw new Error();
    } else {
      return throwOnMissingAccount(request, response, next, authSecretKey);
    }
  } catch (error) {
    console.error(
      error,
      "You must provide the current user's ID when trying to access a gated route."
    );
    return response.status(Constants.HttpStatusCodes.FORBIDDEN).json(
      Helpers.generateErrorResponse({
        body: "Missing important account information.",
      })
    );
  }
}

export async function validateAuthorizedUser(
  request: RequestWithUserId,
  response: Response,
  next: NextFunction
) {
  try {
    const authSecretKey = process.env.AUTH_SECRET_KEY;

    if (!authSecretKey) {
      throw new Error();
    } else {
      return throwOnMissingUserId(request, response, next, authSecretKey);
    }
  } catch (error) {
    console.error(Constants.Errors.AUTH_SECRET_KEY_DOES_NOT_EXIST);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error of unknown origin. Please refresh the page.",
        })
      );
  }
}
