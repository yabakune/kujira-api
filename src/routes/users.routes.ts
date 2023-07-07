import express from "express";

import * as Controllers from "@/controllers";
import * as Middleware from "@/middleware";
import * as Validators from "@/validators";

export const usersRouter = express.Router();

usersRouter.get("/", Controllers.getUsers);

usersRouter.get("/:userId", Controllers.getUser);

const optionalUserUpdateData: Validators.OptionalUserUpdateData = [
  "email",
  "username",
  "currency",
  "theme",
  "mobileNumber",
];
usersRouter.patch(
  "/:userId",
  Middleware.verifyClientPayload({ optionalData: optionalUserUpdateData }),
  Controllers.updateUser
);

// const requiredPasswordUpdateData: Validators.RequiredUpdatePasswordData = [
//   "password",
// ];

const requiredPasswordUpdateData: Validators.RequiredUpdatePasswordData = [
  "oldPassword",
  "newPassword",
];
usersRouter.patch(
  "/:userId/update-password",
  Middleware.verifyClientPayload({ requiredData: requiredPasswordUpdateData }),
  Middleware.validateCorrectOldPassword,
  Middleware.validateNewPasswordIsNotSameAsPreviousPassword,
  Controllers.updateUserPassword
);

usersRouter.delete("/:userId", Controllers.deleteUser);
