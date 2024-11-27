import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../database/postgress/entities/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Article } from '../database/postgress/entities/article.entity';
import { mapCommentWithReplies } from '../utils/map.function';
import { CommentUserReaction } from '../database/postgress/entities/comment.userReaction';
import { ReactionTypes } from '../core/entities/comment.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>,
		@InjectRepository(CommentUserReaction)
		private readonly commentReactionRepository: Repository<CommentUserReaction>,
		private readonly usersService: UsersService
	) {}

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

		author.commentsReceivedCount = (author.commentsReceivedCount || 0) + 1;
		await this.userRepository.save(author);

		await this.usersService.checkAndUpdateUserLevel(authorId);

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

	// async createReactionToComment(userId: string, commentId: string, reactionType: ReactionTypes) {
	// 	const user = await this.userRepository.findOne({ where: { id: userId } });
	// 	if (!user) throw new NotFoundException('Пользователь не найден');
	//
	// 	const comment = await this.commentRepository.findOne({ where: { id: commentId } });
	// 	if (!comment) throw new NotFoundException('Комментарий не найден');
	//
	// 	const existingReaction = await this.commentReactionRepository.findOne({
	// 		where: { user: { id: userId }, comment: { id: commentId } },
	// 	});
	//
	// 	if (existingReaction && existingReaction.type === reactionType) {
	// 		await this.commentReactionRepository.remove(existingReaction);
	//
	// 		if (reactionType === 'like') {
	// 			comment.likes--;
	// 		} else {
	// 			comment.dislikes--;
	// 		}
	//
	// 		await this.commentRepository.save(comment);
	// 		return true;
	// 	}
	//
	// 	if (existingReaction) {
	// 		if (existingReaction.type === 'like') {
	// 			comment.likes--;
	// 			comment.dislikes++;
	// 		} else {
	// 			comment.likes++;
	// 			comment.dislikes--;
	// 		}
	//
	// 		existingReaction.type = reactionType;
	// 		await this.commentReactionRepository.save(existingReaction);
	// 		await this.commentRepository.save(comment);
	//
	// 		return true;
	// 	}
	//
	// 	const newReaction = this.commentReactionRepository.create({
	// 		user,
	// 		comment,
	// 		type: reactionType,
	// 	});
	//
	// 	await this.commentReactionRepository.save(newReaction);
	//
	// 	if (reactionType === 'like') {
	// 		comment.likes++;
	// 	} else {
	// 		comment.dislikes++;
	// 	}
	//
	// 	await this.commentRepository.save(comment);
	//
	// 	return true;
	// }

	async createReactionToComment(userId: string, commentId: string, reactionType: ReactionTypes) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('Пользователь не найден');

		const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ['author'] });
		if (!comment) throw new NotFoundException('Комментарий не найден');

		const commentAuthor = comment.author;
		if (!commentAuthor) throw new NotFoundException('Автор комментария не найден');

		const existingReaction = await this.commentReactionRepository.findOne({
			where: { user: { id: userId }, comment: { id: commentId } },
		});

		if (existingReaction && existingReaction.type === reactionType) {
			await this.commentReactionRepository.remove(existingReaction);

			if (reactionType === 'like') {
				comment.likes--;
				commentAuthor.likesReceivedCount--;
			} else {
				comment.dislikes--;
			}

			await this.commentRepository.save(comment);
			await this.userRepository.save(commentAuthor);
			return true;
		}

		if (existingReaction) {
			if (existingReaction.type === 'like') {
				comment.likes--;
				comment.dislikes++;
				commentAuthor.likesReceivedCount--;
			} else {
				comment.likes++;
				comment.dislikes--;
				commentAuthor.likesReceivedCount++;
			}

			existingReaction.type = reactionType;
			await this.commentReactionRepository.save(existingReaction);
			await this.commentRepository.save(comment);
			await this.userRepository.save(commentAuthor);
			return true;
		}

		const newReaction = this.commentReactionRepository.create({
			user,
			comment,
			type: reactionType,
		});

		await this.commentReactionRepository.save(newReaction);

		if (reactionType === 'like') {
			comment.likes++;
			commentAuthor.likesReceivedCount++;
		} else {
			comment.dislikes++;
		}

		await this.commentRepository.save(comment);
		await this.userRepository.save(commentAuthor);
		await this.usersService.checkAndUpdateUserLevel(commentAuthor.id);

		return true;
	}

	async updateComment(id: string, updateCommentDto: UpdateCommentDto) {
		const comment = await this.commentRepository.preload({
			id,
			...updateCommentDto,
		});

		if (!comment) {
			throw new NotFoundException('Комментарий не найден');
		}

		comment.updatedAt = new Date();
		return this.commentRepository.save(comment);
	}

	async deleteComment(id: string) {
		const deleteResult = await this.commentRepository.delete(id);

		if (deleteResult.affected === 0) {
			throw new NotFoundException('Комментарий не найден');
		}

		return true;
	}
}
