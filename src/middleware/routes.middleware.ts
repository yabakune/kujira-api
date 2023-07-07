import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";

// ========================================================================================= //
// [ MAKING SURE THE CLIENT SENT THE CORRECT DATA TO THE API ] ============================= //
// ========================================================================================= //

function shortCircuitOnUnexpectedPayload(
  response: Response,
  suppliedClientPayload: string[],
  expectedClientPayload: string[]
) {
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

function validateUnexpectedPayload(
  response: Response,
  suppliedClientPayload: string[],
  requiredData?: string[],
  optionalData?: string[]
) {
  if (requiredData && requiredData.length > 0) {
    shortCircuitOnUnexpectedPayload(
      response,
      suppliedClientPayload,
      requiredData
    );
  } else if (optionalData && optionalData.length > 0) {
    shortCircuitOnUnexpectedPayload(
      response,
      suppliedClientPayload,
      optionalData
    );
  }
}

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

function validateMissingRequiredData(
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

    validateUnexpectedPayload(
      response,
      suppliedClientPayload,
      requiredData,
      optionalData
    );

    validateMissingRequiredData(response, suppliedClientPayload, requiredData);

    return next();
  };
}

// ========================================================================================= //
// [ MIDDLEWARE THAT GATES ACCESS TO ROUTES THAT REQUIRE AUTHORIZED ACCESS ] =============== //
// ========================================================================================= //

type RequestWithAccessToken = Request & { accessToken: string | JwtPayload };

function validateAccessTokenExists(
  request: Request,
  response: Response,
  next: NextFunction,
  authSecretKey: string
) {
  try {
    const accessToken = request.header("authorization");

    if (!accessToken) {
      throw new Error();
    } else {
      const decodedAccessToken = jwt.verify(accessToken, authSecretKey);
      // ↓↓↓ Appending decoded access token to Express's `request` object to use in the action user wanted to perform. ↓↓↓ //
      (request as RequestWithAccessToken).accessToken = decodedAccessToken;
      return next();
    }
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.FORBIDDEN).json(
      Helpers.generateErrorResponse({
        body: "Unauthorized access. Please register or log in.",
      })
    );
  }
}

export async function validateAuthorizedUser(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const authSecretKey = process.env.AUTH_SECRET_KEY;

    if (!authSecretKey) {
      throw new Error();
    } else {
      return validateAccessTokenExists(request, response, next, authSecretKey);
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
