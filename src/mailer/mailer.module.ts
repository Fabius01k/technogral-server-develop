import { Module } from '@nestjs/common';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { configDotenv } from 'dotenv';
import { EMailService } from './mailer.service';

configDotenv({ path: '.env' });

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				port: 587,
				secure: false,
				auth: {
					user: 'muraskinpavel5@gmail.com',
					pass: 'dygyirzbaxsscjxw',
				},
			},
			defaults: {
				from: `"From Name" <yournobodu@gmail.com>`,
			},
			template: {
				dir: join(__dirname, '/templates'),
				adapter: new EjsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
	],
	// controllers: [EmailController],
	providers: [EMailService],
})
export class EMailModule {}
