import express from "express";

import * as Controllers from "../controllers";
import * as Middleware from "../middleware";
import * as Validators from "../validators";

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
  "entryId",
];
const optionalPurchaseCreateData: Validators.OptionalPurchaseCreateData = [
  "category",
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
  "placement",
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
purchasesRouter.post(
  "/bulk-delete-purchases",
  Middleware.verifyClientPayload({
    requiredData: requiredBulkDeletePurchasesData,
  }),
  Controllers.bulkDeletePurchases
);

const requiredDeleteEntryPurchasesData = ["entryId"];
purchasesRouter.post(
  "/delete-entry-purchases",
  Middleware.verifyClientPayload({
    requiredData: requiredDeleteEntryPurchasesData,
  }),
  Controllers.deleteEntryPurchases
);

purchasesRouter.delete("/:purchaseId", Controllers.deletePurchase);
