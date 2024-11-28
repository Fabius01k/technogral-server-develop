import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBoosterDto {
	@IsNotEmpty()
	@IsString()
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	price: number;

	@IsNotEmpty()
	@IsString()
	type: string;
}

export class CreateUserBoosterDto {
	@IsNotEmpty()
	@IsString()
	userId: string;

	@IsNotEmpty()
	@IsString()
	boosterId: string;
}

export class UpdateBoosterDto extends PartialType(CreateBoosterDto) {}
