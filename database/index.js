const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // TLS comes from sslmode in DATABASE_URL (Neon uses valid certificates)
  max: 10,
  idleTimeoutMillis: 30000, // drop idle clients before Neon's auto-suspend does
  connectionTimeoutMillis: 10000, // allow for a cold start after auto-suspend
})

// An idle client dropped by the server must not crash the process
pool.on("error", (err) => console.error("Unexpected idle client error:", err.message))

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text, error })
      throw error
    }
  },
}
