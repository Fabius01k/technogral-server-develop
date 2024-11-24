import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../database/postgress/entities/comment.entity';
import { CommentsService } from './comment.service';
import { CommentsController } from './comment.controller';
import { UsersModule } from "../users/users.module";

@Module({
	controllers: [CommentsController],
	providers: [CommentsService],
	exports: [CommentsService],
	imports: [TypeOrmModule.forFeature([Comment]),
		UsersModule],
})
export class CommentModule {}
