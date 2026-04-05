import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class LocalUploadService implements OnModuleInit {
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadBuffer(buffer: Buffer, subfolder: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: subfolder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerErrorException(error?.message ?? 'Cloudinary upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async uploadBase64(base64String: string, subfolder: string): Promise<UploadResult> {
    const dataUri = base64String.startsWith('data:')
      ? base64String
      : `data:image/jpeg;base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: subfolder,
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
