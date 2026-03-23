import { Transform } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator"
import { Role } from "src/generated/prisma/enums"

export class CreateUserDto {
    @IsNotEmpty({ message: 'name not provided'})
    @IsString({ message: 'name must be string'})
    name: string
    @IsNotEmpty({ message: 'email must be provided'})
    @IsString({ message: 'email must be string'})
    @IsEmail({}, { message: 'provide a valid email'})
    @Transform(({ value }) => value?.trim().toLowerCase()) 
    email: string
    @IsNotEmpty({ message: 'phone number not provided'})
    @IsString({ message: 'phone number must be string'})
    phone: string
    @IsOptional()
    @IsEnum(Role, { message: 'role must be a valid Role em value'})
    @Transform(({ value }) => value ? value : 'AGENT' ) 
    role: Role
    @IsOptional()
    image?: string
    @IsOptional()
    publicId?: string
    @IsOptional()
    resourceType?: string
    @IsNotEmpty({ message: 'password not provided'})
    @IsString({ message: 'password must be string must be string'})
    @IsStrongPassword({ minLength: 8, minSymbols: 1, minUppercase: 1 }, { message: 'Password too weak' })
    @Transform(({ value }) => value?.trim())
    password: string
}
