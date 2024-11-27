import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateArticleDto, GetArticlesQuery, UpdateArticleDto } from './article.dto';
import { ArticleService } from './article.service';
import { ReactionTypes } from '../core/entities/comment.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

@Controller('articles')
@UseInterceptors(ResponseInterceptor)
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@Get()
	async GetAllArticles(@Query() query: GetArticlesQuery) {
		console.log(query.tag, 'query.tag');
		return this.articleService.GetAllArticles(query.tag);
	}

	@Get('/:articlesId')
	async GetArticlesById(@Param('articlesId') articlesId: string) {
		return this.articleService.GetArticlesById(articlesId);
	}

	@Post()
	async createArticle(@Body() createArticleDto: CreateArticleDto) {
		return this.articleService.createArticle(createArticleDto);
	}

	@Post('/:articleId/react')
	async createReactionToArticle(
		@Param('articleId') articleId: string,
		@Body('userId') userId: string,
		@Body('reactionType') reactionType: ReactionTypes
	) {
		return this.articleService.createReactionToArticle(userId, articleId, reactionType);
	}

	@Post('/:articleId/upload-image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadPreviewImage(@Param('articleId') articleId: string, @UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new Error('Файл не прикреплен');
		}
		const url = await this.articleService.uploadPreviewImage(articleId, file, 'news-images');

		return { message: 'Фото успешно загружено', url };
	}

	@Put(':articlesId')
	async updateArticle(@Param('articlesId') articlesId: string, @Body() updateArticleDto: UpdateArticleDto) {
		return this.articleService.updateArticle(articlesId, updateArticleDto);
	}

	@Delete(':articlesId')
	async deleteArticle(@Param('articlesId') articlesId: string) {
		return this.articleService.deleteArticle(articlesId);
	}
}
