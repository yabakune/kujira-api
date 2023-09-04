import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export function fetchPurchases(_: Request, response: Response) {
  return Services.fetchPurchases(response);
}

export function fetchPurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  return Services.fetchPurchase(response, Number(request.params.purchaseId));
}

export function fetchEntryPurchases(
  request: Request<{}, {}, Validators.RequiredFetchEntryPurchasesValidator>,
  response: Response
) {
  return Services.fetchEntryPurchases(response, request.body.entryId);
}

export function createPurchase(
  request: Request<
    {},
    {},
    Validators.RequiredPurchaseCreateValidator &
      Validators.OptionalPurchaseCreateValidator
  >,
  response: Response
) {
  return Services.createPurchase(
    response,
    request.body.placement,
    request.body.entryId,
    request.body.category,
    request.body.description,
    request.body.cost
  );
}

export function updatePurchase(
  request: Request<
    { purchaseId: string },
    {},
    Validators.OptionalPurchaseUpdateValidator
  >,
  response: Response
) {
  return Services.updatePurchase(
    response,
    Number(request.params.purchaseId),
    request.body.placement,
    request.body.category,
    request.body.description,
    request.body.cost
  );
}

export function deletePurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  return Services.deletePurchase(response, Number(request.params.purchaseId));
}

export function bulkDeletePurchases(
  request: Request<{}, {}, { purchaseIds: number[] }>,
  response: Response
) {
  return Services.bulkDeletePurchases(response, request.body.purchaseIds);
}

export function deleteEntryPurchases(
  request: Request<{}, {}, { entryId: number }>,
  response: Response
) {
  return Services.deleteEntryPurchases(response, request.body.entryId);
}
