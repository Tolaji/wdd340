// Loads database/schema.sql into the database in DATABASE_URL (fresh DBs only).
const fs = require("fs")
const path = require("path")
const { Client } = require("pg")
require("dotenv").config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const { rows } = await client.query("SELECT to_regclass('public.classification') AS t")
  if (rows[0].t) {
    console.log("classification table already exists; refusing to reload")
    return client.end()
  }
  await client.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"))
  const n = await client.query("SELECT (SELECT count(*) FROM classification) c, (SELECT count(*) FROM inventory) i")
  console.log("loaded:", n.rows[0])
  await client.end()
}
main().catch((e) => { console.error(e.message); process.exit(1) })
