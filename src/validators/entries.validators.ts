import { Prisma } from "@prisma/client";

const entryCreateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: { name: true },
});
export type EntryCreateValidator = Prisma.EntryGetPayload<
  typeof entryCreateValidator
> & { overviewId?: number | null; logbookId?: number | null };
export type RequiredEntryCreateData = (keyof EntryCreateValidator)[];
export type OptionalEntryCreateData = ["overviewId", "logbookId"];

const entryUpdateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: {
    name: true,
    totalSpent: true,
    budget: true,
    overviewId: true,
    logbookId: true,
  },
});
export type EntryUpdateValidator = Partial<
  Prisma.EntryGetPayload<typeof entryUpdateValidator>
>;
export type OptionalEntryUpdateData = (keyof EntryUpdateValidator)[];
