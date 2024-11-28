import { BoostersService } from './booster.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booster } from '../database/postgress/entities/booster.entity';
import { BoostersController } from './booster.controller';
import { UserBooster } from '../database/postgress/entities/usersBooster.entity';
import { S3Module } from "../s3/s3.module";

@Module({
	imports: [TypeOrmModule.forFeature([Booster, UserBooster]), S3Module],
	controllers: [BoostersController],
	providers: [BoostersService],
})
export class BoostersModule {}
