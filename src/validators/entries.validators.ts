import { Prisma } from "@prisma/client";

const requiredEntryCreateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: { name: true },
});
export type RequiredEntryCreateValidator = Prisma.EntryGetPayload<
  typeof requiredEntryCreateValidator
>;
export type RequiredEntryCreateData = (keyof RequiredEntryCreateValidator)[];

const optionalEntryCreateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: { overviewId: true, logbookId: true },
});
export type OptionalEntryCreateValidator = Partial<
  Prisma.EntryGetPayload<typeof optionalEntryCreateValidator>
>;
export type OptionalEntryCreateData = (keyof OptionalEntryCreateValidator)[];

const entryUpdateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: {
    name: true,
    totalSpent: true,
    nonMonthlyTotalSpent: true,
    budget: true,
    overviewId: true,
    logbookId: true,
  },
});
export type EntryUpdateValidator = Partial<
  Prisma.EntryGetPayload<typeof entryUpdateValidator>
>;
export type OptionalEntryUpdateData = (keyof EntryUpdateValidator)[];
