import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|jpg|png|webp)$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function buildMulterOptions(subfolder: string) {
  const uploadPath = join(process.cwd(), 'uploads', subfolder);
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: uploadPath,
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      if (!ALLOWED_IMAGE_TYPES.test(file.mimetype)) {
        return cb(
          new BadRequestException('Only JPEG, PNG and WebP images are allowed'),
          false,
        );
      }
      cb(null, true);
    },
    limits: { fileSize: MAX_FILE_SIZE },
  };
}
