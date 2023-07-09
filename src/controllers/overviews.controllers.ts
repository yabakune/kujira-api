import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function getOverviews(_: Request, response: Response) {
  return Services.getOverviews(response);
}

export async function getOverview(
  request: Request<{ overviewId: string }>,
  response: Response
) {
  return Services.getOverview(response, Number(request.params.overviewId));
}

export async function createOverview(
  request: Request<{}, {}, Validators.OverviewCreateValidator>,
  response: Response
) {
  return Services.createOverview(
    response,
    request.body.income,
    request.body.savings,
    request.body.ownerId
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