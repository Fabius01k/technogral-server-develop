import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from '../database/postgress/entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { Repository } from 'typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { mapArticleWithComments } from '../utils/map.function';
import { ArticleTags } from '../core/entities/article.entity';
import { ArticleUserReaction } from '../database/postgress/entities/article.userReaction';
import { ReactionTypes } from '../core/entities/comment.entity';
import { S3Service } from "../s3/s3.service";

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(ArticleUserReaction)
		private readonly articleReactionRepository: Repository<ArticleUserReaction>,
		private readonly s3Service: S3Service
	) {}

	async GetAllArticles(tag?: ArticleTags): Promise<Article[]> {
		console.log(tag, 'tag');
		const query = this.articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.comments', 'comments')
			.leftJoinAndSelect('comments.author', 'commentAuthor')
			.leftJoinAndSelect('comments.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor')
			.orderBy('article.createdAt', 'DESC')
			.addOrderBy('comments.createdAt', 'ASC')
			.addOrderBy('replies.createdAt', 'ASC');

		if (tag) {
			query.where('article.tag = :tag', { tag });
		}

		const articles = await query.getMany();
		return articles.map(mapArticleWithComments);
	}

	async GetArticlesById(id: string): Promise<Article> {
		const article = await this.articleRepository
			.createQueryBuilder('article')
			.leftJoinAndSelect('article.author', 'author')
			.leftJoinAndSelect('article.comments', 'comments')
			.leftJoinAndSelect('comments.author', 'commentAuthor')
			.leftJoinAndSelect('comments.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor')
			.where('article.id = :id', { id })
			.orderBy('comments.createdAt', 'ASC')
			.addOrderBy('replies.createdAt', 'ASC')
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
			author,
			content,
		});

		const savedArticle = await this.articleRepository.save(article);

		console.log(savedArticle,"savedArticle");

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

	async createReactionToArticle(userId: string, articleId: string, reactionType: ReactionTypes) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('Пользователь не найден');

		const article = await this.articleRepository.findOne({ where: { id: articleId } });
		if (!article) throw new NotFoundException('Новость не найдена');

		const existingReaction = await this.articleReactionRepository.findOne({
			where: { user: { id: userId }, article: { id: articleId } },
		});

		if (existingReaction && existingReaction.type === reactionType) {
			await this.articleReactionRepository.remove(existingReaction);

			if (reactionType === 'like') {
				article.likes--;
			} else {
				article.dislikes--;
			}

			await this.articleRepository.save(article);
			return true;
		}

		if (existingReaction) {
			if (existingReaction.type === 'like') {
				article.likes--;
				article.dislikes++;
			} else {
				article.likes++;
				article.dislikes--;
			}

			existingReaction.type = reactionType;
			await this.articleReactionRepository.save(existingReaction);
			await this.articleRepository.save(article);

			return true;
		}

		const newReaction = this.articleReactionRepository.create({
			user,
			article,
			type: reactionType,
		});

		await this.articleReactionRepository.save(newReaction);

		if (reactionType === 'like') {
			article.likes++;
		} else {
			article.dislikes++;
		}

		await this.articleRepository.save(article);

		return true;
	}

	async uploadPreviewImage(articleId: string, file: Express.Multer.File): Promise<{ previewImage: string }> {
		const article = await this.articleRepository.findOne({ where: { id: articleId } });
		if (!article) throw new NotFoundException('Новость не найдена');

		const previewImage = await this.s3Service.uploadFile(file);

		article.previewImage = previewImage;
		await this.articleRepository.save(article);

		return { previewImage };
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

	async deleteArticle(id: string) {
		const deleteResult = await this.articleRepository.delete(id);

		if (deleteResult.affected === 0) {
			throw new NotFoundException('Новость не найдена');
		}

		return true;
	}
}
