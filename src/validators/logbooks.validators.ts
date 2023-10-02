import { Prisma } from "@prisma/client";

const requiredUserLogbooksFetchValidator =
  Prisma.validator<Prisma.LogbookArgs>()({
    select: {
      ownerId: true,
    },
  });
export type RequiredUserLogbooksFetchValidator = Prisma.LogbookGetPayload<
  typeof requiredUserLogbooksFetchValidator
>;
export type RequiredUserLogbooksData =
  (keyof RequiredUserLogbooksFetchValidator)[];

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
