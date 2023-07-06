import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

const prisma = new PrismaClient();

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

    const { verificationCode, userCode } = Services.generateVerificationCodes();

    const data: Validators.RegistrationValidator = {
      email: request.body.email,
      username: request.body.username,
      password: encryptedPassword,
      verificationCode,
    };
    await prisma.user.create({ data });

    await Helpers.emailUser(
      request.body.email,
      "Kujira: Confirm Registration",
      [
        "Thank you for registering! Glad to have you on board :)",
        `Please copy and paste the following verification code into the app to verify your registration: ${userCode}`,
        "If this is a mistake, you can safely ignore this email.",
      ]
    );

    return response
      .status(Constants.HttpStatusCodes.CREATED)
      .json(
        Helpers.generateTextResponse(
          "Thank you for registering with Kujira. Glad to have you on board!",
          "A verification code was sent to your email. Please enter it below.",
          "Note that your code will expire within 5 minutes."
        )
      );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}

// ========================================================================================= //
// [ VERIFY REGISTRATION ] ================================================================= //
// ========================================================================================= //

// ========================================================================================= //
// [ LOGIN EXISTING USER ] ================================================================= //
// ========================================================================================= //

// ========================================================================================= //
// [ VERIFY LOGIN ] ======================================================================== //
// ========================================================================================= //
