import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import * as Constants from "@/constants";
import * as Routes from "@/routes";
// import { generateResponse } from "./helpers";
import { validateAuthorizedUser } from "@/middleware";

dotenv.config();
const app = express();

app.use(cors()); //Sets CORS for all routes.

if (process.env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // max 20 requests per minute
      max: 20,
    })
  );
}

app.use(helmet()); //Sets HTTP Headers to protect app from well-known web vulnerabilities.
app.use(compression()); // Compresses all routes.

app.use(express.json()); // Allows API to parse client payload.

// ↓↓↓ Routes ↓↓↓
enum RouteBases {
  AUTH = "/api/v1/auth",
  USERS = "/api/v1/users",
  OVERVIEWS = "/api/v1/overviews",
  LOGBOOKS = "/api/v1/logbooks",
  ENTRIES = "/api/v1/entries",
  PURCHASES = "/api/v1/purchases",
  BUG_REPORTS = "/api/v1/bug-reports",
}
app.use(RouteBases.AUTH, Routes.authRouter);
app.use(RouteBases.USERS, validateAuthorizedUser, Routes.usersRouter);
app.use(RouteBases.OVERVIEWS, validateAuthorizedUser, Routes.overviewsRouter);
app.use(RouteBases.LOGBOOKS, validateAuthorizedUser, Routes.logbooksRouter);
app.use(RouteBases.ENTRIES, validateAuthorizedUser, Routes.entriesRouter);
app.use(RouteBases.PURCHASES, validateAuthorizedUser, Routes.purchasesRouter);

// ↓↓↓ Fallback in case I forgot to catch an error somewhere. ↓↓↓ //
const errorFallbackMiddleware: ErrorRequestHandler = (
  error: Error,
  _: Request,
  response: Response,
  next: NextFunction
) => {
  if (error) {
    console.error(error);
    response.status(Constants.HttpStatusCodes.NOT_FOUND).json({
      body: error.message,
    });
    // response.json(generateResponse({ body: error.message }));
  }
};
app.use(errorFallbackMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`🚀 Success! CORS-enabled web server is running on port:${port}`);
});
