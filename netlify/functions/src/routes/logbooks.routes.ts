import express from "express";

import * as Controllers from "../controllers";
import * as Middleware from "../middleware";
import * as Validators from "../validators";

export const logbooksRouter = express.Router();

logbooksRouter.get("/", Controllers.fetchLogbooks);

logbooksRouter.get("/:logbookId", Controllers.fetchLogbook);

const requiredUserLogbooksFetchData: Validators.RequiredUserLogbooksData = [
  "ownerId",
];
logbooksRouter.post(
  "/fetch-user-logbooks",
  Middleware.verifyClientPayload({
    requiredData: requiredUserLogbooksFetchData,
  }),
  Controllers.fetchUserLogbooks
);

const requiredLogbookCreateData: Validators.RequiredLogbookCreateData = [
  "name",
  "ownerId",
];
logbooksRouter.post(
  "/",
  Middleware.verifyClientPayload({ requiredData: requiredLogbookCreateData }),
  Controllers.createLogbook
);

const optionalLogbookUpdateData: Validators.OptionalLogbookUpdateData = [
  "name",
];
logbooksRouter.patch(
  "/:logbookId",
  Middleware.verifyClientPayload({ optionalData: optionalLogbookUpdateData }),
  Controllers.updateLogbook
);

logbooksRouter.delete("/:logbookId", Controllers.deleteLogbook);
