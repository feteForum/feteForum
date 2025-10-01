"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function setAuthCookie(res, payload) {
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 3600 * 1000
    });
}
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'missing' });
    const row = db_1.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!row)
        return res.status(401).json({ error: 'invalid' });
    const ok = bcryptjs_1.default.compareSync(password, row.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'invalid' });
    setAuthCookie(res, { uid: row.id, username: row.username });
    res.json({ ok: true });
});
router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});
router.get('/me', (req, res) => {
    const token = req.cookies?.token;
    if (!token)
        return res.status(401).json({ error: 'no' });
    try {
        const data = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.json({ user: { id: data.uid, username: data.username } });
    }
    catch {
        res.status(401).json({ error: 'invalid' });
    }
});
function ensureAdmin() {
    const row = db_1.db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!row) {
        const hash = bcryptjs_1.default.hashSync('admin', 10);
        db_1.db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
        console.log('👤 Admin créé : admin/admin (changez le mot de passe !)');
    }
}
ensureAdmin();
exports.default = router;
