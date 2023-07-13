import { Request, Response } from "express";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

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
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "Failed to register your account. Please refresh the page and try again.",
        })
      );
  }
}

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
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "Failed to log in. Please refresh the page and try again.",
        })
      );
  }
}

export async function verifyRegistration(
  request: Request<{}, {}, Validators.VerificationCodeValidator>,
  response: Response
) {
  try {
    return Services.verifyUserAuth(
      response,
      "Verifying Registration",
      "Email verified!",
      request.body.email,
      true
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "Failed to verify registration. Please try again.",
        })
      );
  }
}

export async function verifyLogin(
  request: Request<
    {},
    {},
    Validators.VerificationCodeValidator & { thirtyDays?: boolean }
  >,
  response: Response
) {
  try {
    return Services.verifyUserAuth(
      response,
      "Verifying Login",
      "Logging in!",
      request.body.email,
      request.body.thirtyDays
    );
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "Failed to verify login. Please try again.",
        })
      );
  }
}

export async function sendNewVerificationCode(
  request: Request<{}, {}, { email: string }>,
  response: Response
) {
  try {
    return Services.sendUserNewVerificationCode(response, request.body.email);
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to create new registration code. Please try again.",
      })
    );
  }
}

export async function logout(
  request: Request<{}, {}, { email: string }>,
  response: Response
) {
  return Services.logout(response, request.body.email);
}
