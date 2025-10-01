"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUploadDir = ensureUploadDir;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
function ensureUploadDir() {
    const dir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        const dir = process.env.UPLOAD_DIR || 'uploads';
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, safe);
    }
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'missing' });
    const url = '/uploads/' + req.file.filename;
    res.json({ url });
});
exports.default = router;
