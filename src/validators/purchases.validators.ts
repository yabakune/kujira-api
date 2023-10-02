import { Prisma } from "@prisma/client";

const requiredFetchEntryPurchaseValidator =
  Prisma.validator<Prisma.PurchaseArgs>()({
    select: { entryId: true },
  });
export type RequiredFetchEntryPurchasesValidator = Prisma.PurchaseGetPayload<
  typeof requiredFetchEntryPurchaseValidator
>;
export type RequiredFetchEntryPurchasesData =
  (keyof RequiredFetchEntryPurchasesValidator)[];

const requiredPurchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()(
  {
    select: {
      placement: true,
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
    select: { category: true, description: true, cost: true },
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
      placement: true,
      category: true,
      description: true,
      cost: true,
    },
  }
);
export type OptionalPurchaseUpdateValidator = Partial<
  Prisma.PurchaseGetPayload<typeof optionalPurchaseUpdateValidator>
>;
export type OptionalPurchaseUpdateData =
  (keyof OptionalPurchaseUpdateValidator)[];
