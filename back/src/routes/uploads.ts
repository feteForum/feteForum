import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'

export function ensureUploadDir() {
  const dir = process.env.UPLOAD_DIR || 'uploads'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const dir = process.env.UPLOAD_DIR || 'uploads'
    cb(null, dir)
  },
  filename: function (_req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-')
    cb(null, safe)
  }
})
const upload = multer({ storage })

const router = Router()

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'missing' })
  const url = '/uploads/' + req.file.filename
  res.json({ url })
})

export default router
