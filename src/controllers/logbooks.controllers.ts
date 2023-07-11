import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function getLogbooks(_: Request, response: Response) {
  return Services.getLogbooks(response);
}

export async function getLogbook(
  request: Request<{ logbookId: string }>,
  response: Response
) {
  return Services.getLogbook(response, Number(request.params.logbookId));
}

export async function createLogbook(
  request: Request<{}, {}, Validators.RequiredLogbookCreateValidator>,
  response: Response
) {
  return Services.createLogbook(
    response,
    request.body.name,
    request.body.ownerId
  );
}

export async function updateLogbook(
  request: Request<
    { logbookId: string },
    {},
    Validators.LogbookUpdateValidator
  >,
  response: Response
) {
  return Services.updateLogbook(
    response,
    Number(request.params.logbookId),
    request.body.name
  );
}

export async function deleteLogbook(
  request: Request<{ logbookId: string }>,
  response: Response
) {
  return Services.deleteLogbook(response, Number(request.params.logbookId));
}
