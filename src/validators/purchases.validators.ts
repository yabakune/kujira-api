import { Prisma } from "@prisma/client";

const requiredPurchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()(
  {
    select: {
      category: true,
      entryId: true,
    },
  }
);
export type RequiredPurchaseCreateValidator = Prisma.PurchaseGetPayload<
  typeof requiredPurchaseCreateValidator
>;
export type RequiredPurchaseCreateData =
  (keyof RequiredPurchaseCreateValidator)[];

const optionalPurchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()(
  {
    select: { description: true, cost: true },
  }
);
export type OptionalPurchaseCreateValidator = Partial<
  Prisma.PurchaseGetPayload<typeof optionalPurchaseCreateValidator>
>;
export type OptionalPurchaseCreateData =
  (keyof OptionalPurchaseCreateValidator)[];

const optionalPurchaseUpdateValidator = Prisma.validator<Prisma.PurchaseArgs>()(
  {
    select: {
      category: true,
      description: true,
      cost: true,
    },
  }
);
export type OptionalPurchaseUpdateValidator = Prisma.PurchaseGetPayload<
  typeof optionalPurchaseUpdateValidator
>;
export type OptionalPurchaseUpdateData =
  (keyof OptionalPurchaseUpdateValidator)[];
