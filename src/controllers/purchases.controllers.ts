import { Request, Response } from "express";

import * as Services from "@/services";
import * as Validators from "@/validators";

export async function fetchPurchases(_: Request, response: Response) {
  return Services.fetchPurchases(response);
}

export async function fetchPurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  return Services.fetchPurchase(response, Number(request.params.purchaseId));
}

export async function createPurchase(
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
    request.body.category,
    request.body.entryId,
    request.body.description,
    request.body.cost
  );
}

export async function updatePurchase(
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
    request.body.category,
    request.body.description,
    request.body.cost
  );
}

export async function deletePurchase(
  request: Request<{ purchaseId: string }>,
  response: Response
) {
  return Services.deletePurchase(response, Number(request.params.purchaseId));
}

export async function bulkDeletePurchases(
  request: Request<{}, {}, { purchaseIds: number[] }>,
  response: Response
) {
  return Services.bulkDeletePurchases(response, request.body.purchaseIds);
}

export async function deleteAllEntryPurchases(
  request: Request<{}, {}, { entryId: number }>,
  response: Response
) {
  return Services.deleteAllEntryPurchases(response, request.body.entryId);
}
