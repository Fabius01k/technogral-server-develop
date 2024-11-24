import { OmitType, PartialType, PickType } from "@nestjs/mapped-types";
import { Genders, UserEntity, UserRoles } from '../core/entities/user.entity';
import { IsDate, isEmail, IsEmail, IsEnum, IsNumber, IsString, Length } from "class-validator";

export class UserDto implements Partial<Omit<UserEntity, 'id' | 'updatedAt' | 'createdAt'>> {
	@IsString()
	@Length(4, 32)
	login: string;

	@IsString()
	password: string;

	@IsString()
	nickname: string;

	@IsString()
	avatar: string;

	@IsDate()
	birthday: Date;

	@IsEnum(Genders)
	gender: Genders;

	@IsEnum(UserRoles)
	role: UserRoles;

	@IsEmail()
	email: string;

	@IsNumber()
	likes: number;

	@IsNumber()
	dislikes: number;
}

export class CreateUserDto extends PickType(UserDto, ['email', 'password']) {}

// export class UpdateUserDto extends OmitType(UserDto, ['login', 'email']) {}
export class UpdateUserDto extends PartialType(UserDto) {}

export type TChangePasswordDto = Pick<UserEntity, 'password'> & { newPassword: string };
export class ChangePasswordDto implements TChangePasswordDto {
	@IsString()
	password: string;

	@IsString()
	newPassword: string;
}

export type TForgotPasswordDto = Pick<UserEntity, 'email'> & NonNullable<unknown>;
export class ForgotPasswordDto implements TForgotPasswordDto {
	@IsEmail({}, { message: 'Invalid email address' })
	email: string;
}
