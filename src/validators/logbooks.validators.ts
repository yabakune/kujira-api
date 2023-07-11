import { Prisma } from "@prisma/client";

const requiredLogbookCreateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: {
    name: true,
    ownerId: true,
  },
});
export type RequiredLogbookCreateValidator = Prisma.LogbookGetPayload<
  typeof requiredLogbookCreateValidator
>;
export type RequiredLogbookCreateData =
  (keyof RequiredLogbookCreateValidator)[];

const logbookUpdateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: { name: true },
});
export type LogbookUpdateValidator = Partial<
  Prisma.LogbookGetPayload<typeof logbookUpdateValidator>
>;
export type OptionalLogbookUpdateData = (keyof LogbookUpdateValidator)[];
