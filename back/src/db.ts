import Database from 'better-sqlite3'
import fs from 'fs'

const dbFile = process.env.DB_FILE || 'database.sqlite'
const firstTime = !fs.existsSync(dbFile)
export const db = new Database(dbFile)

if (firstTime) {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log('Database initialized.')
}
