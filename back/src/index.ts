import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'

import authRoutes from './routes/auth'
import postsRoutes from './routes/posts'
import uploadRoutes, { ensureUploadDir } from './routes/uploads'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

ensureUploadDir()
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/upload', uploadRoutes)

app.use(express.static(process.env.PUBLIC!));

app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`)
})
