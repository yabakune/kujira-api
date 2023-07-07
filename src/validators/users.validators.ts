import { Prisma } from "@prisma/client";

// ========================================================================================= //
// [ USER UPDATE VALIDATORS ] ============================================================== //
// ========================================================================================= //

const userUpdateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    currency: true,
    theme: true,
    mobileNumber: true,
  },
});
export type UserUpdateValidator = Partial<
  Prisma.UserGetPayload<typeof userUpdateValidator>
>;
export type OptionalUserUpdateData = (keyof UserUpdateValidator)[];

// ========================================================================================= //
// [ UPDATE PASSWORD VALIDATORS ] ========================================================== //
// ========================================================================================= //

export type UpdatePasswordValidator = {
  oldPassword: string;
  newPassword: string;
};
export type RequiredUpdatePasswordData = (keyof UpdatePasswordValidator)[];
