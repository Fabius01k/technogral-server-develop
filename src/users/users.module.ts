import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { UsersController } from './users.controller';
import { EMailService } from "../mailer/mailer.service";
import { S3Module } from "../s3/s3.module";

@Module({
	controllers: [UsersController],
	providers: [UsersService, EMailService],
	exports: [UsersService, TypeOrmModule],
	imports: [TypeOrmModule.forFeature([User]), S3Module],
})
export class UsersModule {}
