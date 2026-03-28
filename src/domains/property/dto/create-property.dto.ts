import { Transform } from "class-transformer"
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { PropertyStatus } from "src/generated/prisma/enums"

export class CreatePropertyDto {
    @IsNotEmpty({ message: 'property title not provided' })
    @IsString({ message: 'property title must be a string' })
    title: string

    @IsNotEmpty({ message: 'property description not provided' })
    @IsString({ message: 'property description must be a string' })
    description: string

    @IsNotEmpty({ message: 'property type not provided' })
    @IsString({ message: 'property typne must be string and all capitalized' })
    type: string

    @IsNotEmpty({ message: 'property rent amount not provided' })
    @IsInt()
    amount: number

    @IsNotEmpty({ message: 'property rent duration not provided' })
    @IsString({ message: 'property rent duration must be string and all capitalize' })
    duration: string

    @IsNotEmpty({ message: 'property address not provided' })
    @IsString({ message: 'property address must a string' })
    address: string

    @IsNotEmpty({ message: 'provide city property\'s in' })
    @IsString({ message: 'property city value must be string' })
    city: string

    @IsOptional()
    @IsNotEmpty({ message: 'provide area property\'s in' })
    @IsString({ message: 'property area value must be string' })
    @Transform(({ value }) => value ? value : null ) 
    area: string

    @IsNotEmpty({ message: 'provide state property\'s in' })
    @IsString({ message: 'property state value must be string' })
    state: string

    @IsNotEmpty({ message: 'provide country property\'s in' })
    @IsString({ message: 'property country value must be string' })
    country: string

    @IsOptional()
    @IsEnum(PropertyStatus, { message: 'status must be a valid PropertyStatus value' })
    @Transform(({ value }) => value ? value : PropertyStatus.AVAILABLE ) 
    status: PropertyStatus
}