import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const overviewRouter = express.Router();

overviewRouter.get("/", Controllers.getOverviews);

overviewRouter.get("/:overviewId", Controllers.getOverview);

const requiredOverviewCreateData: Validators.RequiredOverviewCreateData = [
  "income",
  "ownerId",
];
const optionalOverviewCreateData: Validators.RequiredOverviewCreateData = [
  "savings",
];
overviewRouter.post(
  "/",
  Middleware.verifyClientPayload({
    requiredData: requiredOverviewCreateData,
    optionalData: optionalOverviewCreateData,
  }),
  Controllers.createOverview
);

const optionalOverviewUpdateData: Validators.OptionalOverviewUpdateData = [
  "income",
  "savings",
];
overviewRouter.patch(
  "/:overviewId",
  Middleware.verifyClientPayload({ optionalData: optionalOverviewUpdateData }),
  Controllers.updateOverview
);

overviewRouter.delete("/:overviewId", Controllers.deleteOverview);
