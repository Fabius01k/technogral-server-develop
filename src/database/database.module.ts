import { Module } from '@nestjs/common';
import typeormPostgress from './postgress/postgress.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [typeormPostgress],
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => configService.get('typeorm'),
		}),
	],
})
export class DatabaseModule {}
