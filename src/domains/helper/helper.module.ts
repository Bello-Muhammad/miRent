import { Module } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";
import { ImageValidationPipe } from "./file.validation";

@Module({
    providers: [CloudinaryService, ImageValidationPipe],
    exports: [CloudinaryService, ImageValidationPipe]
})
export class HelperModule {}