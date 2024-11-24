import { Body, Controller, Delete, Get, Param, Post, Put, ValidationPipe } from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { CommentsService } from './comment.service';

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post()
	async createComment(@Body(new ValidationPipe()) createCommentDto: CreateCommentDto) {
		return this.commentsService.createComment(createCommentDto);
	}

	@Get('wall/:userId')
	async getCommentsOnWall(@Param('userId') userId: string) {
		return this.commentsService.getWallCommentsWithReplies(userId);
	}

	@Put('/:commentId')
	async updateComment(
		@Param('commentId') commentId: string,
		@Body(new ValidationPipe()) updateCommentDto: UpdateCommentDto
	) {
		return this.commentsService.updateComment(commentId, updateCommentDto);
	}

	@Delete('/:commentId')
	async deleteComment(@Param('commentId') commentId: string) {
		return this.commentsService.deleteComment(commentId);
	}
}
