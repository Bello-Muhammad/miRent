import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'provide your current password' })
    @IsString({ message: 'current password must be a string' })
    currentPassword: string
    @IsNotEmpty({ message: 'new password not provided' })
    @IsString({ message: 'new password must be a string' })
    @IsStrongPassword({ minLength: 7, minSymbols: 1, minUppercase: 1 }, { message: 'Password too weak' })
    newPassword: string
}