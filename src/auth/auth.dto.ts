import { IsEmail, IsString, ValidateIf } from "class-validator";
import { UserEntity } from 'src/core/entities/user.entity';

export class AuthLoginDto {
	@IsString()
	emailOrNickname: string;

	@IsString()
	password: string;
}

export class AuthRegisterDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}

export interface AuthResponse extends UserEntity {
	accessToken: string;
}
