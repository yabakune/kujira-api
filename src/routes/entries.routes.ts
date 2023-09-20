import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const entriesRouter = express.Router();

entriesRouter.get("/", Controllers.fetchEntries);

entriesRouter.get("/:entryId", Controllers.fetchEntry);

entriesRouter.post(
  "/fetch-overview-entries",
  Middleware.verifyClientPayload({
    requiredData: ["overviewId"],
  }),
  Controllers.fetchOverviewEntries
);

entriesRouter.post(
  "/fetch-logbook-entries",
  Middleware.verifyClientPayload({
    requiredData: ["logbookId"],
  }),
  Controllers.fetchLogbookEntries
);

const requiredEntryCreateData: Validators.RequiredEntryCreateData = ["name"];
const optionalEntryCreateData: Validators.OptionalEntryCreateData = [
  "overviewId",
  "logbookId",
];
entriesRouter.post(
  "/",
  Middleware.verifyClientPayload({
    requiredData: requiredEntryCreateData,
    optionalData: optionalEntryCreateData,
  }),
  Middleware.checkIfEntryWithNameAlreadyExists,
  Controllers.createEntry
);

const optionalEntryUpdateData: Validators.OptionalEntryUpdateData = [
  "name",
  "totalSpent",
  "nonMonthlyTotalSpent",
  "budget",
  "logbookId",
  "overviewId",
];
entriesRouter.patch(
  "/:entryId",
  Middleware.verifyClientPayload({ optionalData: optionalEntryUpdateData }),
  Middleware.checkIfEntryWithNameAlreadyExists,
  Controllers.updateEntry
);

entriesRouter.delete("/:entryId", Controllers.deleteEntry);
