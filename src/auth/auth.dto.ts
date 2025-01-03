import { IsDate, IsDateString, IsEmail, IsEnum, IsString, ValidateIf } from "class-validator";
import { Genders, UserEntity } from "src/core/entities/user.entity";
import { Transform } from "class-transformer";

export class AuthLoginDto {
	@IsString()
	emailOrLogin: string;

	@IsString()
	password: string;
}

export class AuthRegisterDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;

	@IsString()
	nickname: string;

	@IsString()
	gender: string;

	@IsDateString()
	birthday: Date;
}

export class UserCreateLoginDto {
	@IsString()
	login: string;
}

export interface AuthResponse extends UserEntity {
	accessToken: string;
}
