import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
import * as Services from "@/services";
import * as Validators from "@/validators";

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
export function decodeVerificationCode(
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
    throw new Error();
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
        Helpers.generateErrorResponse(
          error,
          "Failed to register new account. Please try again."
        )
      );
  }
}

export function generateAccessToken(
  userId: number,
  authSecretKey: string,
  thirtyDayExpiration: boolean = false
) {
  const accessToken = jwt.sign({ _id: userId.toString() }, authSecretKey, {
    expiresIn: thirtyDayExpiration ? "30 days" : "7 days",
  });
  return accessToken;
}

type EmailVerificationPayload = {
  verifiedUser: User;
  accessToken: string;
};

export async function verifyRegistrationWithAuthToken(
  email: string
): Promise<EmailVerificationPayload> {
  const verifiedUser = await prisma.user.update({
    where: { email },
    data: { verificationCode: null, emailVerified: true },
  });

  const authSecretKey = process.env.AUTH_SECRET_KEY;
  if (authSecretKey) {
    const accessToken = generateAccessToken(
      verifiedUser.id,
      authSecretKey,
      true
    );
    return { verifiedUser, accessToken };
  } else {
    console.log("AUTH_SECRET_KEY environment variable does not exist.");
    throw new Error();
  }
}

export async function loginUserAndEmailVerificationCode(
  response: Response,
  email: string
) {
  try {
    const { verificationCode, decodedVerificationCode } =
      generateAuthVerificationCodes();

    await prisma.user.update({
      where: { email },
      data: { verificationCode },
    });

    await Helpers.emailUser(email, "Kujira: Confirm Login", [
      "Welcome back! I missed you :'D",
      `Please copy and paste the following verification code into the app to verify your registration: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateTextResponse({
        title: "Welcome back!",
        body: "A verification code was sent to your email. Please enter it below.",
        caption: "Note that your code will expire within 5 minutes.",
      })
    );
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(
        Helpers.generateErrorResponse(
          error,
          "Failed to login. Please try again."
        )
      );
  }
}

export async function verifyLoginWithAuthToken(
  email: string,
  thirtyDays?: boolean
) {
  const verifiedUser = await prisma.user.update({
    where: { email },
    data: { verificationCode: null },
  });

  const authSecretKey = process.env.AUTH_SECRET_KEY;
  if (authSecretKey) {
    const accessToken = generateAccessToken(
      verifiedUser.id,
      authSecretKey,
      true
    );
    return { verifiedUser, accessToken };
  } else {
    console.log("AUTH_SECRET_KEY environment variable does not exist.");
    throw new Error();
  }
}

export async function updateAndEmailUserWithNewVerificationCode(
  response: Response,
  email: string
) {
  try {
    const { verificationCode, decodedVerificationCode } =
      generateAuthVerificationCodes();

    const userWithNewVerificationCode = await prisma.user.update({
      where: { email },
      data: { verificationCode: verificationCode },
    });

    const safeUser = Services.generateSafeUser(userWithNewVerificationCode);

    await Helpers.emailUser(email, "Kujira: New Verification Code", [
      "This email is in response to your request for a new verification code.",
      `Please copy and paste the following verification code into the app to verify your account: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return safeUser;
  } catch (error) {
    return response
      .status(Constants.HttpStatusCodes.BAD_REQUEST)
      .json(Helpers.generateErrorResponse(error));
  }
}