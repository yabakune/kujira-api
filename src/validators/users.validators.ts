import { Prisma } from "@prisma/client";

const userUpdateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    currency: true,
    theme: true,
    mobileNumber: true,
    emailVerified: true,
    onboarded: true,
  },
});
export type UserUpdateValidator = Partial<
  Prisma.UserGetPayload<typeof userUpdateValidator>
>;

const userUpdatePasswordValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { password: true },
});

export type UserUpdatePasswordValidator = Prisma.UserGetPayload<
  typeof userUpdatePasswordValidator
>;
