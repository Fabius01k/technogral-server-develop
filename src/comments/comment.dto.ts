import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsString()
	text: string;

	@IsNotEmpty()
	authorId: string;

	@IsOptional()
	@IsString()
	wallOwnerId?: string;

	@IsOptional()
	@IsString()
	parentCommentId?: string;

	@IsOptional()
	@IsString()
	articleId?: string;
}

export class UpdateCommentDto {
	@IsNotEmpty()
	@IsString()
	text: string;
}
