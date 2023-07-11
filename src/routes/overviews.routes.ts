import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const overviewsRouter = express.Router();

overviewsRouter.get("/", Controllers.getOverviews);

overviewsRouter.get("/:overviewId", Controllers.getOverview);

const requiredOverviewCreateData: Validators.RequiredOverviewCreateData = [
  "income",
  "ownerId",
];
const optionalOverviewCreateData: Validators.RequiredOverviewCreateData = [
  "savings",
];
overviewsRouter.post(
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
overviewsRouter.patch(
  "/:overviewId",
  Middleware.verifyClientPayload({ optionalData: optionalOverviewUpdateData }),
  Controllers.updateOverview
);

overviewsRouter.delete("/:overviewId", Controllers.deleteOverview);
