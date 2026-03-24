import { IsNotEmpty, IsString } from "class-validator";

export class AdminActionDto {
    @IsNotEmpty({ message: 'status action not provided'})
    @IsString({ message: 'status value must be string'})
    status: string
}