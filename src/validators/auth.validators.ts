import { Prisma } from "@prisma/client";

const registrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    verificationCode: true,
  },
});
export type RegistrationValidator = Prisma.UserGetPayload<
  typeof registrationValidator
>;
export type RequiredRegistrationData = (keyof RegistrationValidator)[];

const loginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    password: true,
  },
});
export type LoginValidator = Prisma.UserGetPayload<typeof loginValidator>;
export type RequiredLoginData = (keyof LoginValidator)[];

const verificationCodeValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { email: true, verificationCode: true },
});
export type VerificationCodeValidator = Prisma.UserGetPayload<
  typeof verificationCodeValidator
>;
export type RequiredVerificationCodeData = (keyof VerificationCodeValidator)[];
