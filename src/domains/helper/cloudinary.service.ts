import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import 'dotenv/config';

@Injectable()
export class CloudinaryService {
    constructor() {
        v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
            api_key: process.env.CLOUDINARY_API_KEY as string,
            api_secret: process.env.CLOUDINARY_API_SECRET as string,
        });
    }

    async uploadImage(
        fileName: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {

            const upload = v2.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve(result as UploadApiResponse);
            });
            toStream(fileName.buffer).pipe(upload);
        });
    }

    async uploadSingleImage(file: Express.Multer.File) {
        try {

            if (!file) {
                throw new BadRequestException('No image file provided');
            }

            const uploadResult = await this.uploadImage(file);

            return {
                publicId: uploadResult.public_id,
                resourceType: uploadResult.resource_type,
                url: uploadResult.secure_url
            };

        } catch (error) {
            Logger.error(`Error uploading single image:`, error);
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new InternalServerErrorException("Failed to upload image");
            }
        }
    }

    async uploadMultipleImages(files: Express.Multer.File[]) {
        try {
            if (!files || files.length === 0) {
                throw new BadRequestException('No image files provided');
            }


            const multipleUploads = await Promise.all(
                files.map(async (file) => await this.uploadSingleImage(file))
            )

            return multipleUploads;
        } catch (error) {
            Logger.error(`Error uploading multiple images:`, error);
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new InternalServerErrorException("Failed to process image files upload");
            }
        }
    }

    async deleteImages(publicIds: string[], resourceType: string = 'image') {
        if (!publicIds?.length) return;

        try {
            const result = await v2.api.delete_resources(publicIds, {
                resource_type: resourceType,
                invalidate: true,
            });

            // delete_resources returns a map of { publicId: 'deleted' | 'not_found' }
            const failed = Object.entries(result.deleted)
                .filter(([_, status]) => status !== 'deleted')
                .map(([publicId]) => publicId);

            if (failed.length) {
                Logger.warn(`Some images were not deleted from Cloudinary: ${failed.join(', ')}`);
            }

            return result;
        } catch (error) {
            Logger.error('Error deleting images from Cloudinary:', error);
            throw new InternalServerErrorException('Could not delete images from storage');
        }
    }
}