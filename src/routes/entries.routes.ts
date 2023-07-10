import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const entriesRouter = express.Router();

entriesRouter.get("/", Controllers.getEntries);

entriesRouter.get("/:entryId", Controllers.getEntry);

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
  Controllers.createEntry
);

const optionalEntryUpdateData: Validators.OptionalEntryUpdateData = [
  "name",
  "totalSpent",
  "budget",
  "logbookId",
  "overviewId",
];
entriesRouter.patch(
  "/:entryId",
  Middleware.verifyClientPayload({ optionalData: optionalEntryUpdateData }),
  Controllers.updateEntry
);

entriesRouter.delete("/:entryId", Controllers.deleteEntry);
