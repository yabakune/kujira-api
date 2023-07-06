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
// [ CHECK VERIFICATION CODE FOR VERIFYING REGISTRATION / LOGIN ] ========================== //
// ========================================================================================= //

export async function verifyRegistration(
  request: Request<{}, {}, Validators.VerificationCodeValidator>,
  response: Response
) {
  try {
    const { verifiedUser, accessToken } =
      await Services.verifyNewUserWithAuthToken(request.body.email);

    const safeUser = Services.generateSafeUser(verifiedUser);

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
// [ LOGIN EXISTING USER ] ================================================================= //
// ========================================================================================= //

// ========================================================================================= //
// [ RESEND VERIFICATION CODE ] ============================================================ //
// ========================================================================================= //
