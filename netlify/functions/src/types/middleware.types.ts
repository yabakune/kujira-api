import { User } from "@prisma/client";

// ↓↓↓ Adding our found user to the middleware chain so we don't have to search for it with every step. ↓↓↓ //
export type AttachedUserFromPreviousMiddleware = {
  attachedUserFromPreviousMiddleware?: User;
};
