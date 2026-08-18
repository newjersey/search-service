import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

// GRANTS_DATABASE_URL should point to a role with read-only access to the
// `grants` table specifically — never an application's full credentials.
// See docs/architectural-design.md's DevSecOps section for why.
export const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.GRANTS_DATABASE_URL,
      statement_timeout: 5_000,
    }),
  }),
});
