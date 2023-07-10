import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function getEntries(_: Request, response: Response) {
  return Services.getEntries(response);
}

export async function getEntry(
  request: Request<{ entryId: string }>,
  response: Response
) {
  return Services.getEntry(response, Number(request.params.entryId));
}

export async function createEntry(
  request: Request<{}, {}, Validators.EntryCreateValidator>,
  response: Response
) {
  return Services.createEntry(
    response,
    request.body.name,
    request.body.overviewId,
    request.body.logbookId
  );
}

export async function updateEntry(
  request: Request<{ entryId: string }, {}, Validators.EntryUpdateValidator>,
  response: Response
) {
  return Services.updateEntry(
    response,
    Number(request.params.entryId),
    request.body.name,
    request.body.totalSpent,
    request.body.budget,
    request.body.overviewId,
    request.body.logbookId
  );
}

export async function deleteEntry(
  request: Request<{ entryId: string }>,
  response: Response
) {
  return Services.deleteEntry(response, Number(request.params.entryId));
}
