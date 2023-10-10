import { DataSource } from "typeorm";
import { Company } from "./entity/Company";

export default new DataSource({
  entities: [Company],
  type: "postgres",
  url: "postgresql://postgress:postgress@localhost:5432/postgress",
  synchronize: true,
});
