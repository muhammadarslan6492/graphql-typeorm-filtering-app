import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { Company } from "../entity/Company";

export const CompanyType = objectType({
  name: "Company",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.nonNull.int("zip");
    t.nonNull.string("city");
  },
});

export const ProductMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createCompany", {
      type: "Company",
      args: {
        name: nonNull(stringArg()),
        city: nonNull(stringArg()),
        zip: nonNull(intArg()),
      },
      resolve(_parent, args, _context, _info): Promise<Company> {
        const { name, city, zip } = args;
        return Company.create({ name, city, zip }).save();
      },
    });
  },
});

export const ProductsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("companies", {
      type: "Company",
      args: {
        filter: stringArg(),
      },
      resolve(_parent, args, _context, _info): Promise<Company[]> {
        if (!args.filter) {
          return Company.find();
        }

        const filters = args.filter.split(" ");

        const companyQueryBuilder = Company.createQueryBuilder("company");

        filters.forEach((filter: any) => {
          companyQueryBuilder.andWhere(
            "company.name ILIKE :filter OR company.city ILIKE :filter OR company.zip::text ILIKE :filter",
            { filter: `%${filter}%` }
          );

          // Check if the filter is a number and include zip in the numeric comparison
          if (!isNaN(filter)) {
            companyQueryBuilder.orWhere("company.zip = :zip", {
              zip: parseInt(filter, 10),
            });
          }
        });

        return companyQueryBuilder.getMany();
      },
    });
  },
});
