import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../database/postgress/entities/article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { UsersModule } from '../users/users.module';
import { ArticleUserReaction } from '../database/postgress/entities/article.userReaction';
import { S3Module } from '../s3/s3.module';

@Module({
	imports: [TypeOrmModule.forFeature([Article, ArticleUserReaction]), UsersModule, S3Module],
	controllers: [ArticleController],
	providers: [ArticleService],
	exports: [ArticleService, TypeOrmModule],
})
export class ArticleModule {}
