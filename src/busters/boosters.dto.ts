import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
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
	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	boosterIds: string[];

	@IsOptional()
	@IsString()
	processor?: string;

	@IsOptional()
	@IsString()
	videoCard?: string;

	@IsOptional()
	@IsString()
	motherboard?: string;

	@IsOptional()
	@IsString()
	ram?: string;

	@IsOptional()
	@IsString()
	case?: string;

	@IsOptional()
	@IsString()
	cooling?: string;
}


export class UpdateBoosterDto extends PartialType(CreateBoosterDto) {}
