import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  async transform(files: any) {
    // make sure we always work with a real array of files
    const fileArray: Express.Multer.File[] = [];

    if (Array.isArray(files)) {
      fileArray.push(...files);
    } else if (files && Array.isArray(files.images)) {
      fileArray.push(...files.images);
    }

    // early exit when nothing to validate
    if (fileArray.length === 0) {
      return files;
    }

    fileArray.forEach(file => {

      if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Invalid file type. Only images are allowed.');
      }

      if (file.size > 1024 * 1024 * 10) {
        throw new BadRequestException('Each image must be ≤10MB');
      }
    });

    return files;
  }
}