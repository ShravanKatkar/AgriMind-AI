import { connectDB } from "../lib/mongodb"

connectDB()
  .then((m) => {
    console.log("OK: connectDB()", m.connection.db?.databaseName)
    process.exit(0)
  })
  .catch((e) => {
    console.error("FAIL:", e.message)
    process.exit(1)
  })
