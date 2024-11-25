import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from '../database/postgress/entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { Repository } from 'typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { mapArticleWithComments } from '../utils/map.function';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async GetAllArticles(): Promise<Article[]> {
		const articles = await this.articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.comments', 'comments')
			.leftJoinAndSelect('comments.author', 'commentAuthor')
			.leftJoinAndSelect('comments.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor')
			.orderBy('article.createdAt', 'DESC')
			.addOrderBy('comments.createdAt', 'ASC')
			.addOrderBy('replies.createdAt', 'ASC')
			.getMany();

		return articles.map(mapArticleWithComments);
	}

	async GetArticlesById(id: string): Promise<Article> {
		const article = await this.articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author') // Загрузка автора статьи
			.leftJoinAndSelect('article.comments', 'comments') // Загрузка комментариев статьи
			.leftJoinAndSelect('comments.author', 'commentAuthor') // Загрузка авторов комментариев
			.leftJoinAndSelect('comments.replies', 'replies') // Загрузка ответов на комментарии
			.leftJoinAndSelect('replies.author', 'replyAuthor') // Загрузка авторов ответов
			.where('article.id = :id', { id })
			.orderBy('comments.createdAt', 'ASC') // Сортировка комментариев
			.addOrderBy('replies.createdAt', 'ASC') // Сортировка ответов
			.getOne();

		if (!article) {
			throw new NotFoundException('Новость не найдена');
		}

		return mapArticleWithComments(article);
	}

	async createArticle(createArticleDto: CreateArticleDto) {
		const { title, previewImage, tag, authorId, content } = createArticleDto;

		const author = await this.userRepository.findOne({ where: { id: authorId } });
		if (!author) throw new NotFoundException('Пользователь не найден');

		const article = this.articleRepository.create({
			title,
			previewImage,
			tag,
			authorId,
			content,
		});

		const savedArticle = await this.articleRepository.save(article);

		return {
			id: savedArticle.id,
			title: savedArticle.title,
			previewImage: savedArticle.previewImage,
			content: savedArticle.content,
			createdAt: savedArticle.createdAt,
			author: {
				id: savedArticle.author?.id,
				nickname: savedArticle.author?.nickname,
				avatar: savedArticle.author?.avatar,
			},
		};
	}

	async updateArticle(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
		const article = await this.articleRepository.preload({
			id,
			...updateArticleDto,
		});

		if (!article) {
			throw new NotFoundException('Новость не найдена');
		}
		article.updatedAt = new Date();
		return this.articleRepository.save(article);
	}

	async deleteArticle(id: string): Promise<{ message: string }> {
		const article = await this.articleRepository.findOne({ where: { id } });
		if (!article) {
			throw new NotFoundException('Новость не найдена');
		}

		await this.articleRepository.remove(article);
		return { message: 'Новость удалена' };
	}
}
