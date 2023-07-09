import { Prisma } from "@prisma/client";

const overviewCreateValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    ownerId: true,
  },
});
export type OverviewCreateValidator = Prisma.OverviewGetPayload<
  typeof overviewCreateValidator
> & { savings?: number };
export type RequiredOverviewCreateData = (keyof OverviewCreateValidator)[];

const overviewUpdateValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    savings: true,
  },
});
export type OverviewUpdateValidator = Partial<
  Prisma.OverviewGetPayload<typeof overviewUpdateValidator>
>;
export type OptionalOverviewUpdateData = (keyof OverviewUpdateValidator)[];
