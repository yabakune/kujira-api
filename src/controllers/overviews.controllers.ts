import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function fetchOverviews(_: Request, response: Response) {
  return Services.fetchOverviews(response);
}

export async function fetchOverview(
  request: Request<{ overviewId: string }>,
  response: Response
) {
  return Services.fetchOverview(response, Number(request.params.overviewId));
}

export async function fetchLogbookOverview(
  request: Request<{}, {}, { logbookId: number }>,
  response: Response
) {
  return Services.fetchLogbookOverview(response, request.body.logbookId);
}

export async function createOverview(
  request: Request<{}, {}, Validators.OverviewCreateValidator>,
  response: Response
) {
  return Services.createOverview(
    response,
    request.body.income,
    request.body.savings,
    request.body.logbookId
  );
}

export async function updateOverview(
  request: Request<
    { overviewId: string },
    {},
    Validators.OverviewUpdateValidator
  >,
  response: Response
) {
  return Services.updateOverview(
    response,
    Number(request.params.overviewId),
    request.body.income,
    request.body.savings
  );
}

export async function deleteOverview(
  request: Request<{ overviewId: string }>,
  response: Response
) {
  return Services.deleteOverview(response, Number(request.params.overviewId));
}
