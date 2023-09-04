import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const purchasesRouter = express.Router();

purchasesRouter.get("/", Controllers.fetchPurchases);

purchasesRouter.get("/:purchaseId", Controllers.fetchPurchase);

const requiredFetchEntryPurchasesData: Validators.RequiredFetchEntryPurchasesData =
  ["entryId"];
purchasesRouter.post(
  "/fetch-entry-purchases",
  Middleware.verifyClientPayload({
    requiredData: requiredFetchEntryPurchasesData,
  }),
  Controllers.fetchEntryPurchases
);

const requiredPurchaseCreateData: Validators.RequiredPurchaseCreateData = [
  "category",
  "entryId",
];
const optionalPurchaseCreateData: Validators.OptionalPurchaseCreateData = [
  "cost",
  "description",
];
purchasesRouter.post(
  "/",
  Middleware.verifyClientPayload({
    requiredData: requiredPurchaseCreateData,
    optionalData: optionalPurchaseCreateData,
  }),
  Controllers.createPurchase
);

const optionalPurchaseUpdateData: Validators.OptionalPurchaseUpdateData = [
  "category",
  "cost",
  "description",
];
purchasesRouter.patch(
  "/:purchaseId",
  Middleware.verifyClientPayload({ optionalData: optionalPurchaseUpdateData }),
  Controllers.updatePurchase
);

const requiredBulkDeletePurchasesData = ["purchaseIds"];
purchasesRouter.delete(
  "/bulk-delete-purchases",
  Middleware.verifyClientPayload({
    requiredData: requiredBulkDeletePurchasesData,
  }),
  Controllers.bulkDeletePurchases
);

const requiredDeleteAllEntryPurchasesData = ["entryId"];
purchasesRouter.delete(
  "/delete-all-entry-purchases",
  Middleware.verifyClientPayload({
    requiredData: requiredDeleteAllEntryPurchasesData,
  }),
  Controllers.deleteAllEntryPurchases
);

purchasesRouter.delete("/:purchaseId", Controllers.deletePurchase);
