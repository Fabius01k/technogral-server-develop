import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../database/postgress/entities/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Article } from '../database/postgress/entities/article.entity';
import { mapCommentWithReplies } from "../utils/map.function";

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>
	) {}

	async createComment(createCommentDto: CreateCommentDto) {
		const { text, authorId, wallOwnerId, parentCommentId, articleId } = createCommentDto;

		const author = await this.userRepository.findOne({ where: { id: authorId } });
		if (!author) throw new NotFoundException('Пользователь не найден');

		let wallOwner = null;
		if (wallOwnerId) {
			wallOwner = await this.userRepository.findOne({ where: { id: wallOwnerId } });
			if (!wallOwner) throw new NotFoundException('Владелец стены не найден');
		}

		let parentComment = null;
		if (parentCommentId) {
			parentComment = await this.commentRepository.findOne({ where: { id: parentCommentId } });
			if (!parentComment) throw new NotFoundException('Родительский комментарий не найден');
		}

		let article = null;
		if (articleId) {
			article = await this.articleRepository.findOne({ where: { id: articleId } });
			if (!article) throw new NotFoundException('Статья не найдена');
		}

		const comment = this.commentRepository.create({
			text,
			author,
			wallOwner,
			parentComment,
			article,
			updatedAt: null,
		});
		const savedComment = await this.commentRepository.save(comment);

		return {
			id: savedComment.id,
			text: savedComment.text,
			likes: savedComment.likes,
			dislikes: savedComment.dislikes,
			createdAt: savedComment.createdAt,
			updatedAt: savedComment.updatedAt,
			author: {
				id: savedComment.author?.id,
				nickname: savedComment.author?.nickname,
				avatar: savedComment.author?.avatar,
			},
		};
	}

	async getWallCommentsWithReplies(userId: string) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('User not found');

		const comments = await this.commentRepository
			.createQueryBuilder('comment')
			.leftJoinAndSelect('comment.author', 'author')
			.leftJoinAndSelect('comment.replies', 'replies')
			.leftJoinAndSelect('replies.author', 'replyAuthor')
			.leftJoinAndSelect('replies.replies', 'nestedReplies')
			.leftJoinAndSelect('nestedReplies.author', 'nestedReplyAuthor')
			.where('comment.wallOwner = :userId', { userId })
			.andWhere('comment.parentComment IS NULL')
			.orderBy('comment.createdAt', 'ASC')
			.addOrderBy('replies.createdAt', 'ASC')
			.addOrderBy('nestedReplies.createdAt', 'ASC')
			.getMany();

		return comments.map(mapCommentWithReplies);
	}

	async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
		const { text } = updateCommentDto;

		const comment = await this.commentRepository.findOne({ where: { id: commentId } });
		if (!comment) throw new NotFoundException('Комментарий не найден');

		comment.text = text;
		comment.updatedAt = new Date();
		return await this.commentRepository.save(comment);
	}

	async deleteComment(commentId: string): Promise<{ message: string }> {
		const comment = await this.commentRepository.findOne({ where: { id: commentId } });
		if (!comment) throw new NotFoundException('Комментарий не найден');

		await this.commentRepository.remove(comment);
		return { message: 'Комментарий удалён' };
	}
}
