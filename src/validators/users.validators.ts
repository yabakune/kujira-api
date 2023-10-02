import { Prisma } from "@prisma/client";

const userUpdateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    currency: true,
    theme: true,
    mobileNumber: true,
    onboarded: true,
  },
});
export type UserUpdateValidator = Partial<
  Prisma.UserGetPayload<typeof userUpdateValidator>
>;
export type OptionalUserUpdateData = (keyof UserUpdateValidator)[];

export type UpdatePasswordValidator = {
  oldPassword: string;
  newPassword: string;
};
export type RequiredUpdatePasswordData = (keyof UpdatePasswordValidator)[];
