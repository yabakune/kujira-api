import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import * as Constants from "@/constants";
import * as Helpers from "@/helpers";
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
    console.error(Constants.Errors.VERIFICATION_CODE_SECRET_KEY_DOES_NOT_EXIST);
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
      Helpers.generateResponse({
        title: "Verify Registration",
        body: "A verification code was sent to your email. Please enter it below.",
        caption: "Note that your code will expire within 5 minutes.",
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to register new account. Please try again.",
      })
    );
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
      "Welcome back!",
      `Please copy and paste the following verification code into the app to verify your registration: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateResponse({
        title: "Verify Login",
        body: "A verification code was sent to your email. Please enter it below.",
        caption: "Note that your code will expire within 5 minutes.",
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to log in. Please try again.",
      })
    );
  }
}

// ========================================================================================= //
// [ VERIFYING USER REGISTRATION / LOGIN ] ================================================= //
// ========================================================================================= //

const months: { [key: string]: string } = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

function formatDateToName(): string {
  const today = new Date();
  const month = months[today.getMonth()];
  const year = today.getFullYear();
  return `${month} ${year}`;
}

async function verifyRegistration(
  response: Response,
  user: User,
  accessToken: string
) {
  try {
    const { id: userId } = await prisma.user.update({
      where: { email: user.email },
      data: { accessToken, verificationCode: null, emailVerified: true },
    });

    const { id: logbookId } = await prisma.logbook.create({
      data: {
        name: formatDateToName(),
        ownerId: userId,
      },
    });

    const { id: overviewId } = await prisma.overview.create({
      data: { income: 0, logbookId },
    });

    await prisma.entry.createMany({
      data: [
        { name: "Recurring", overviewId },
        { name: "Incoming", overviewId },
      ],
      skipDuplicates: true,
    });

    // Just exit this function and move onto the next step if everything's 👍
    return;
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "An error occurred while verifying your registration. Please refresh the page and try again.",
        })
      );
  }
}

async function verifyLogin(
  response: Response,
  user: User,
  accessToken: string
) {
  try {
    await prisma.user.update({
      where: { email: user.email },
      data: { accessToken, verificationCode: null },
    });

    // Just exit this function and move onto the next step if everything's 👍
    return;
  } catch (error) {
    console.error(error);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "An error occurred while verifying your login. Please refresh the page and try again.",
        })
      );
  }
}

async function authenticateUser(
  response: Response,
  user: User,
  authAction: "Verifying Registration" | "Verifying Login",
  responseBody: string,
  thirtyDayExpiration: boolean = false
) {
  try {
    const authSecretKey = process.env.AUTH_SECRET_KEY;
    if (!authSecretKey) {
      throw new Error();
    } else {
      const accessToken = jwt.sign({ _id: user.id.toString() }, authSecretKey, {
        expiresIn: thirtyDayExpiration ? "30 days" : "7 days",
      });

      if (authAction === "Verifying Registration") {
        verifyRegistration(response, user, accessToken);
      } else {
        verifyLogin(response, user, accessToken);
      }

      const safeUser = Helpers.generateSafeUser(user);

      return response.status(Constants.HttpStatusCodes.OK).json(
        Helpers.generateResponse({
          body: responseBody,
          response: { safeUser },
        })
      );
    }
  } catch (error) {
    console.error(Constants.Errors.AUTH_SECRET_KEY_DOES_NOT_EXIST);
    return response
      .status(Constants.HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        Helpers.generateErrorResponse({
          body: "There was an error with authenticating your account. Please log in or request a new verification code.",
        })
      );
  }
}

export async function verifyUserAuth(
  response: Response,
  authAction: "Verifying Registration" | "Verifying Login",
  responseBody: string,
  email: string,
  thirtyDayExpiration: boolean = false
) {
  try {
    let user = await prisma.user.findUniqueOrThrow({
      where: { email },
    });

    return authenticateUser(
      response,
      user,
      authAction,
      responseBody,
      thirtyDayExpiration
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}

// ========================================================================================= //
// [ SEND NEW VERIFICATION CODE ] ========================================================== //
// ========================================================================================= //

export async function sendUserNewVerificationCode(
  response: Response,
  email: string
) {
  try {
    const { verificationCode, decodedVerificationCode } =
      generateAuthVerificationCodes();

    const userWithNewVerificationCode = await prisma.user.update({
      where: { email },
      data: { verificationCode },
    });

    const safeUser = Helpers.generateSafeUser(userWithNewVerificationCode);

    await Helpers.emailUser(email, "Kujira: New Verification Code", [
      "This email is in response to your request for a new verification code.",
      `Please copy and paste the following verification code into the app to verify your account: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "New verification code sent! Please check your email.",
        response: { safeUser },
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to send new verification code. Please try again.",
      })
    );
  }
}

// ========================================================================================= //
// [ PASSWORD RESET ] ====================================================================== //
// ========================================================================================= //

export async function requestPasswordReset(response: Response, email: string) {
  try {
    const { verificationCode, decodedVerificationCode } =
      generateAuthVerificationCodes();

    await prisma.user.update({
      where: { email },
      data: { verificationCode },
    });

    await Helpers.emailUser(email, "Kujira: Password Reset", [
      "This email is in response to your request to reset your password.",
      `Please copy and paste the following verification code into the app to verify your account: ${decodedVerificationCode}`,
      "If this is a mistake, you can safely ignore this email.",
    ]);

    return response.status(Constants.HttpStatusCodes.CREATED).json(
      Helpers.generateResponse({
        title: "Verify Password Reset",
        body: "A verification code was sent to your email. Please enter it below.",
        caption: "Note that your code will expire within 5 minutes.",
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}

export async function verifyPasswordResetRequest(
  response: Response,
  email: string
) {
  try {
    await prisma.user.update({
      where: { email },
      data: { verificationCode: null },
    });

    return response.status(Constants.HttpStatusCodes.OK).json(
      Helpers.generateResponse({
        body: "Verified! Please enter your new password in the next step.",
      })
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Failed to verify password reset. Please refresh the page and try again.",
      })
    );
  }
}

async function checkNewPasswordIsDifferentFromOldPassword(
  response: Response,
  email: string,
  oldPassword: string,
  newPassword: string
) {
  try {
    const passwordsMatch = bcrypt.compareSync(newPassword, oldPassword);

    if (passwordsMatch) {
      throw new Error();
    } else {
      const encryptedPassword = await Helpers.encryptPassword(newPassword);

      await prisma.user.update({
        where: { email },
        data: { password: encryptedPassword },
      });

      return response.status(Constants.HttpStatusCodes.OK).json(
        Helpers.generateResponse({
          body: "Your password has been reset! Please log in with your new password.",
        })
      );
    }
  } catch (error) {
    console.log(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: "Your new password cannot be the same as your previous password.",
      })
    );
  }
}

export async function resetUserPassword(
  response: Response,
  email: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    return checkNewPasswordIsDifferentFromOldPassword(
      response,
      email,
      user.password,
      newPassword
    );
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.BAD_REQUEST).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}

// ========================================================================================= //
// [ LOG OUT USER ] ======================================================================== //
// ========================================================================================= //

export async function logout(response: Response, userId: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { accessToken: null },
    });

    return response
      .status(Constants.HttpStatusCodes.OK)
      .json(Helpers.generateResponse({ body: "Logged out!" }));
  } catch (error) {
    console.error(error);
    return response.status(Constants.HttpStatusCodes.NOT_FOUND).json(
      Helpers.generateErrorResponse({
        body: Constants.Errors.ACCOUNT_DOES_NOT_EXIST,
      })
    );
  }
}
