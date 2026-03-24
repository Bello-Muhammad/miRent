import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  async transform(value: any) {
    // Handle single file
    if (value && typeof value === 'object' && value.mimetype) {
      return this.validateFile(value);
    }

    // Handle multiple files (existing logic)
    const fileArray: Express.Multer.File[] = [];

    if (Array.isArray(value)) {
      fileArray.push(...value);
    } else if (value && Array.isArray(value.images)) {
      fileArray.push(...value.images);
    }

    // early exit when nothing to validate
    if (fileArray.length === 0) {
      return value;
    }

    fileArray.forEach(file => {
      if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Invalid file type. Only images are allowed.');
      }

      if (file.size > 1024 * 1024 * 10) {
        throw new BadRequestException('Each image must be ≤10MB');
      }
    });

    return value;
  }

  async validateFile(file: Express.Multer.File) {

    if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > 1024 * 1024 * 10) {
      throw new BadRequestException('Each image must be ≤10MB');
    }

    return file;
  }
}