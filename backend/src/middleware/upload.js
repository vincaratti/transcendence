import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
export const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');

fs.mkdirSync(AVATARS_DIR, { recursive: true });

const ALLOWED_TYPES = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/gif': '.gif',
	'image/webp': '.webp',
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, AVATARS_DIR),
	filename: (req, file, cb) => {
		const ext = ALLOWED_TYPES[file.mimetype] ?? '';
		const name = `${req.user.userId}-${crypto.randomUUID()}${ext}`;
		cb(null, name);
	},
});

export const uploadAvatar = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (ALLOWED_TYPES[file.mimetype]) {
			cb(null, true);
		} else {
			cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
		}
	},
}).single('avatar');
