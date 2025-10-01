"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    if (!token)
        return res.status(401).json({ error: 'unauthorized' });
    try {
        jsonwebtoken_1.default.verify(token, JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'unauthorized' });
    }
}
router.get('/', (_req, res) => {
    const rows = db_1.db.prepare('SELECT * FROM posts ORDER BY id DESC').all();
    res.json(rows);
});
router.get('/:id', (req, res) => {
    const row = db_1.db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    if (!row)
        return res.status(404).json({ error: 'not_found' });
    res.json(row);
});
router.post('/', requireAuth, (req, res) => {
    const { title, content, cover_url } = req.body;
    if (!title || !content)
        return res.status(400).json({ error: 'missing' });
    const info = db_1.db.prepare('INSERT INTO posts (title, content, cover_url) VALUES (?, ?, ?)').run(title, content, cover_url);
    const row = db_1.db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
});
router.put('/:id', requireAuth, (req, res) => {
    const { title, content, cover_url } = req.body;
    const exists = db_1.db.prepare('SELECT 1 FROM posts WHERE id = ?').get(req.params.id);
    if (!exists)
        return res.status(404).json({ error: 'not_found' });
    db_1.db.prepare('UPDATE posts SET title=?, content=?, cover_url=? WHERE id = ?').run(title, content, cover_url, req.params.id);
    const row = db_1.db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    res.json(row);
});
router.delete('/:id', requireAuth, (req, res) => {
    db_1.db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});
exports.default = router;
