import { Transform } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
    @IsNotEmpty({ message: 'email must be provided'})
    @IsString({ message: 'email must be string'})
    @IsEmail({}, { message: 'provide a valid email'})
    @Transform(({ value }) => value?.trim().toLowerCase()) 
    email: string

    @IsNotEmpty({ message: 'password not provided'})
    @IsString({ message: 'password must be string must be string'})
    @Transform(({ value }) => value?.trim())
    password: string
}
