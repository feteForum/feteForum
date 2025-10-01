"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const dbFile = process.env.DB_FILE || 'database.sqlite';
const firstTime = !fs_1.default.existsSync(dbFile);
exports.db = new better_sqlite3_1.default(dbFile);
if (firstTime) {
    exports.db.exec(`
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
  `);
    console.log('Database initialized.');
}
