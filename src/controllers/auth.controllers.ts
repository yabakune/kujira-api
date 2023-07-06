import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import * as Helpers from "@/helpers";
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

    const data: Validators.RegistrationValidator = {
      email: request.body.email,
      username: request.body.username,
      password: encryptedPassword,
    };
  } catch (error) {}
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
