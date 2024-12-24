import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, ValidationPipe } from "@nestjs/common";
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { CommentsService } from './comment.service';
import { ReactionTypes } from '../core/entities/comment.entity';
import { AuthGuard } from "../auth/auth.guard";

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Get('wall/:userId')
	async getCommentsOnWall(@Param('userId') userId: string) {
		return this.commentsService.getWallCommentsWithReplies(userId);
	}

	@UseGuards(AuthGuard)
	@Post()
	async createComment(@Body(new ValidationPipe()) createCommentDto: CreateCommentDto) {
		return this.commentsService.createComment(createCommentDto);
	}

	@UseGuards(AuthGuard)
	@Post('/:commentId/react')
	async createReactionToComment(
		@Param('commentId') commentId: string,
		@Body('userId') userId: string,
		@Body('reactionType') reactionType: ReactionTypes
	) {
		return this.commentsService.createReactionToComment(userId, commentId, reactionType);
	}

	@UseGuards(AuthGuard)
	@Put('/:commentId')
	async updateComment(
		@Param('commentId') commentId: string,
		@Body(new ValidationPipe()) updateCommentDto: UpdateCommentDto
	) {
		return this.commentsService.updateComment(commentId, updateCommentDto);
	}

	@UseGuards(AuthGuard)
	@Delete('/:commentId')
	async deleteComment(@Param('commentId') commentId: string) {
		return this.commentsService.deleteComment(commentId);
	}
}
