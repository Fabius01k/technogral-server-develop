import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JWT_CONFIG } from './auth.constants';

// console.log('hello');

@Module({
	imports: [
		UsersModule,
		JwtModule.register({
			global: true,
			secret: JWT_CONFIG.secret,
		}),
	],
	providers: [
		AuthService,
		// {
		// 	provide: APP_GUARD,
		// 	useClass: AuthGuard,
		// },
	],
	controllers: [AuthController],
})
export class AuthModule {}
