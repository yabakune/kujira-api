import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

// ========================================================================================= //
// [ FETCH All USERS ] ===================================================================== //
// ========================================================================================= //

export async function getUsers(_: Request, response: Response) {
  return Services.getUsers(response);
}

// ========================================================================================= //
// [ FETCH A USER ] ======================================================================== //
// ========================================================================================= //

export async function getUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  return Services.getUser(response, Number(request.params.userId));
}

// ========================================================================================= //
// [ UPDATE A USER ] ======================================================================= //
// ========================================================================================= //

export async function updateUser(
  request: Request<{ userId: string }, {}, Validators.UserUpdateValidator>,
  response: Response
) {
  return Services.updateUser(
    response,
    Number(request.params.userId),
    request.body.email,
    request.body.username,
    request.body.currency,
    request.body.theme,
    request.body.mobileNumber
  );
}

// ========================================================================================= //
// [ UPDATE A USER'S PASSWORD ] ============================================================ //
// ========================================================================================= //

export async function updateUserPassword(
  request: Request<{ userId: string }, {}, Validators.UpdatePasswordValidator>,
  response: Response
) {
  return Services.updateUserPassword(
    response,
    Number(request.params.userId),
    request.body.newPassword
  );
}

// ========================================================================================= //
// [ DELETE A USER ] ======================================================================= //
// ========================================================================================= //

export async function deleteUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  return Services.deleteUser(response, Number(request.params.userId));
}
