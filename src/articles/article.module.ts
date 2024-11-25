import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../database/postgress/entities/article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [TypeOrmModule.forFeature([Article]), UsersModule],
	controllers: [ArticleController],
	providers: [ArticleService],
	exports: [ArticleService, TypeOrmModule],
})
export class ArticleModule {}
