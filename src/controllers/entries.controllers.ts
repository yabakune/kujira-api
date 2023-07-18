import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function fetchEntries(_: Request, response: Response) {
  return Services.fetchEntries(response);
}

export async function fetchEntry(
  request: Request<{ entryId: string }>,
  response: Response
) {
  return Services.fetchEntry(response, Number(request.params.entryId));
}

export async function fetchOverviewEntries(
  request: Request<{}, {}, { overviewId: number }>,
  response: Response
) {
  return Services.fetchOverviewEntries(response, request.body.overviewId);
}

export async function fetchLogbookEntries(
  request: Request<{}, {}, { logbookId: number }>,
  response: Response
) {
  return Services.fetchLogbookEntries(response, request.body.logbookId);
}

export async function createEntry(
  request: Request<
    {},
    {},
    Validators.RequiredEntryCreateValidator &
      Validators.OptionalEntryCreateValidator
  >,
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
