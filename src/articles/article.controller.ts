import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { Article } from '../database/postgress/entities/article.entity';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@Get()
	async GetAllArticles() {
		return this.articleService.GetAllArticles();
	}

	@Get('/:articlesId')
	async GetArticlesById(@Param('articlesId') articlesId: string) {
		return this.articleService.GetArticlesById(articlesId);
	}

	@Post()
	async createArticle(@Body() createArticleDto: CreateArticleDto) {
		return this.articleService.createArticle(createArticleDto);
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
