import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../database/postgress/entities/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	private mapCommentWithReplies(comment: Comment): any {
		return {
			id: comment.id,
			text: comment.text,
			likes: comment.likes,
			dislikes: comment.dislikes,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
			author: {
				id: comment.author.id,
				nickname: comment.author.nickname,
				avatar: comment.author.avatar,
			},
			replies: comment.replies ? comment.replies.map(this.mapCommentWithReplies.bind(this)) : [],
		};
	}

	async createComment(createCommentDto: CreateCommentDto) {
		const { text, authorId, wallOwnerId, parentCommentId } = createCommentDto;

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
			if (!parentComment) throw new NotFoundException('Родителський комментарий не найден');
		}

		const comment = this.commentRepository.create({
			text,
			author,
			wallOwner,
			parentComment,
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
			parentComment: savedComment.parentComment
				? {
						id: savedComment.parentComment.id,
						text: savedComment.parentComment.text,
						likes: savedComment.parentComment.likes,
						dislikes: savedComment.parentComment.dislikes,
						createdAt: savedComment.parentComment.createdAt,
						updatedAt: savedComment.parentComment.updatedAt,
					}
				: null,
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

		return comments.map(this.mapCommentWithReplies.bind(this));
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
