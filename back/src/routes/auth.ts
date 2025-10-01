import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

type JWTPayload = { uid: number, username: string }

function setAuthCookie(res: any, payload: JWTPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7*24*3600*1000
  })
}

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'missing' })

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  if (!row) return res.status(401).json({ error: 'invalid' })
  const ok = bcrypt.compareSync(password, row.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid' })

  setAuthCookie(res, { uid: row.id, username: row.username })
  res.json({ ok: true })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'no' })
  try {
    const data = jwt.verify(token, JWT_SECRET) as JWTPayload
    res.json({ user: { id: data.uid, username: data.username } })
  } catch {
    res.status(401).json({ error: 'invalid' })
  }
})

function ensureAdmin() {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get('admin')
  if (!row) {
    const hash = bcrypt.hashSync('admin', 10)
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash)
    console.log('👤 Admin créé : admin/admin (changez le mot de passe !)')
  }
}
ensureAdmin()

export default router
