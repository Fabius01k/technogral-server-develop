import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ArticleTags } from '../core/entities/article.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateArticleDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsNotEmpty()
	@IsString()
	previewImage: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags: string[];

	@IsNotEmpty()
	@IsString()
	authorId: string;

	@IsNotEmpty()
	@IsString()
	content: string;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class GetArticlesQuery {
	@IsOptional()
	@IsEnum(ArticleTags, { message: 'Invalid tag' })
	tag?: ArticleTags;
}
