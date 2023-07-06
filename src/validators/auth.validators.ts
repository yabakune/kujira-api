import { Prisma } from "@prisma/client";

const registrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
  },
});
export type RegistrationValidator = Prisma.UserGetPayload<
  typeof registrationValidator
>;

const verifyRegistrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { verificationCode: true },
});

const loginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    password: true,
  },
});
export type LoginValidator = Prisma.UserGetPayload<typeof loginValidator>;

const verifyLoginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { verificationCode: true },
});
