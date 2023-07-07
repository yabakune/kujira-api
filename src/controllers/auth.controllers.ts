import { Request, Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

// ========================================================================================= //
// [ REGISTER NEW USER ] =================================================================== //
// ========================================================================================= //

export async function register(
  request: Request<{}, {}, Validators.RegistrationValidator>,
  response: Response
) {
  try {
    const encryptedPassword = await Helpers.encryptPassword(
      request.body.password
    );

    return Services.registerNewUserAndEmailVerificationCode(
      response,
      request.body.email,
      request.body.username,
      encryptedPassword
    );
  } catch (error) {
    console.log("Auth Register Error:", error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ LOGIN EXISTING USER ] ================================================================= //
// ========================================================================================= //

export async function login(
  request: Request<{}, {}, Validators.LoginValidator>,
  response: Response
) {
  try {
    return Services.loginUserAndEmailVerificationCode(
      response,
      request.body.email
    );
  } catch (error) {
    console.log("Auth Register Error:", error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ VERIFY REGISTRATION ] ================================================================= //
// ========================================================================================= //

export async function verifyRegistration(
  request: Request<{}, {}, Validators.VerificationCodeValidator>,
  response: Response
) {
  try {
    const verifiedUser = await Services.generateVerifiedUser(
      "Verifying Registration",
      request.body.email
    );
    const safeUser = Services.generateSafeUser(verifiedUser);

    const accessToken = Services.generateAccessToken(response, safeUser.id);

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateDataResponse(
          { safeUser, accessToken },
          "Email verified!"
        )
      );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ VERIFY LOGIN ] ======================================================================== //
// ========================================================================================= //

export async function verifyLogin(
  request: Request<
    {},
    {},
    Validators.VerificationCodeValidator & { thirtyDays?: boolean }
  >,
  response: Response
) {
  try {
    const verifiedUser = await Services.generateVerifiedUser(
      "Verifying Login",
      request.body.email
    );
    const safeUser = Services.generateSafeUser(verifiedUser);

    const accessToken = Services.generateAccessToken(
      response,
      safeUser.id,
      request.body.thirtyDays
    );

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateDataResponse({ safeUser, accessToken }, "Logged in!")
      );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ SEND NEW VERIFICATION CODE ] ========================================================== //
// ========================================================================================= //

export async function sendNewVerificationCode(
  request: Request<{}, {}, { email: string }>,
  response: Response
) {
  try {
    const safeUser = await Services.sendUserNewVerificationCode(
      response,
      request.body.email
    );

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(
        Helpers.generateDataResponse(
          safeUser,
          "New verification code sent! Please check your email."
        )
      );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Failed to create new registration code. Please refresh the page and try again."
        )
      );
  }
}
