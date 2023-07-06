import { Prisma } from "@prisma/client";

// ========================================================================================= //
// [ REGISTRATION VALIDATOR ] ============================================================== //
// ========================================================================================= //

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

// ========================================================================================= //
// [ LOGIN VALIDATOR ] ===================================================================== //
// ========================================================================================= //

const loginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    password: true,
  },
});
export type LoginValidator = Prisma.UserGetPayload<typeof loginValidator>;

// ========================================================================================= //
// [ VERIFICATION CODE VALIDATOR ] ========================================================= //
// ========================================================================================= //

const verificationCodeValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { email: true, verificationCode: true },
});
export type VerificationCodeValidator = Prisma.UserGetPayload<
  typeof verificationCodeValidator
>;
export type RequiredVerificationCodeData = (keyof VerificationCodeValidator)[];
