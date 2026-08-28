import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

export async function startTestDb(): Promise<{
  db: Kysely<any>;
  container: StartedPostgreSqlContainer;
}> {
  let container: StartedPostgreSqlContainer;
  try {
    container = await new PostgreSqlContainer("postgres:16").start();
  } catch (cause) {
    throw new Error(
      "Integration tests need a running container runtime (e.g. Docker, Colima, Podman) to start Postgres. Start yours and re-run `npm run test`.",
      { cause },
    );
  }
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: container.getConnectionUri() }),
    }),
  });
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await db.schema
    .createTable("grants")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("category", "text", (col) => col.notNull())
    .addColumn("funding_amount", "numeric", (col) => col.notNull())
    .addColumn("application_deadline", "date", (col) => col.notNull())
    .execute();
  return { db, container };
}

export async function stopTestDb(
  db: Kysely<any> | undefined,
  container: StartedPostgreSqlContainer | undefined,
): Promise<void> {
  if (!db || !container) return;
  await db.destroy();
  await container.stop();
}

export async function seedGrants(db: Kysely<any>): Promise<void> {
  await db
    .insertInto("grants")
    .values([
      {
        title: "Education Grant",
        description: "Support for schools",
        status: "open",
        category: "education",
        funding_amount: 50000,
        application_deadline: "2026-12-01",
      },
      {
        title: "Health Grant",
        description: "Support for clinics",
        status: "closed",
        category: "health",
        funding_amount: 75000,
        application_deadline: "2026-06-01",
      },
      {
        title: "Infrastructure Grant",
        description: "Support for roads",
        status: "open",
        category: "infrastructure",
        funding_amount: 120000,
        application_deadline: "2027-01-15",
      },
    ])
    .execute();
}
