import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Validators from "@/validators";
import { Response } from "express";

const prisma = new PrismaClient();

function generateVerificationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const verificationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return verificationCode;
}

type Decoded = { code: string } & jwt.JwtPayload;
function decodeVerificationCode(
  verificationCode: string,
  secretKey: string
): string {
  const { code } = jwt.verify(verificationCode, secretKey) as Decoded;
  return code;
}

function generateAuthVerificationCodes() {
  const secretKey = process.env.VERIFICATION_CODE_SECRET_KEY;
  if (secretKey) {
    const verificationCode = generateVerificationCode(secretKey);
    const decodedVerificationCode = decodeVerificationCode(
      verificationCode,
      secretKey
    );
    return { verificationCode, decodedVerificationCode };
  } else {
    console.log(
      "VERIFICATION_CODE_SECRET_KEY environment variable does not exist."
    );
    throw new Error(
      "There was an error creating your account. Please try again. If the issue persists, please contact kujira.help@outlook.com."
    );
  }
}

export async function registerNewUserAndEmailVerificationCode(
  response: Response,
  email: string,
  username: string,
  password: string
) {
  try {
    const { verificationCode, decodedVerificationCode } =
      generateAuthVerificationCodes();

    const data: Validators.RegistrationValidator = {
      email,
      username,
      password,
      verificationCode,
    };

    await prisma.user.create({ data });

    await Helpers.emailUser(email, "Kujira: Confirm Registration", [
      "Thank you for registering! Glad to have you on board :)",
      `Please copy and paste the following verification code into the app to verify your registration: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateTextResponse({
        title: "Thank you for registering with Kujira!",
        body: "A verification code was sent to your email. Please enter it below.",
        caption: "Note that your code will expire within 5 minutes.",
      })
    );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(error, "Failed to register new account.")
      );
  }
}

export async function verifyNewUser(email: string) {
  const verifiedUser = await prisma.user.update({
    where: { email },
    data: { verificationCode: null, emailVerified: true },
  });
  return verifiedUser;
}

// function checkJWTExpired(jsonWebToken: string, secretKey: string): boolean {
//   let isExpired = false;
//   jwt.verify(jsonWebToken, secretKey, function <Error>(error: Error) {
//     if (error) isExpired = true;
//   });
//   return isExpired;
// }
