import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../database/postgress/entities/article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { UsersModule } from '../users/users.module';
import { ArticleUserReactionEntity } from '../database/postgress/entities/article.userReaction.entity';
import { S3Module } from '../s3/s3.module';
import {  Tag } from "../database/postgress/entities/articleTag.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Article, ArticleUserReactionEntity, Tag]), UsersModule, S3Module],
	controllers: [ArticleController],
	providers: [ArticleService],
	exports: [ArticleService, TypeOrmModule],
})
export class ArticleModule {}
