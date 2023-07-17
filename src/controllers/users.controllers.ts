import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function fetchUsers(_: Request, response: Response) {
  return Services.fetchUsers(response);
}

export async function fetchUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  return Services.fetchUser(response, Number(request.params.userId));
}

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

export async function deleteUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  return Services.deleteUser(response, Number(request.params.userId));
}
