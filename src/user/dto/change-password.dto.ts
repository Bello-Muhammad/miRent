import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'provide your current password' })
    currentPassword: string
    @IsNotEmpty({ message: 'password not provided' })
    @IsString({ message: 'password must be string must be string' })
    @IsStrongPassword({ minLength: 7, minSymbols: 1, minUppercase: 1 }, { message: 'Password too weak' })
    newPassword: string
}