import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EMailService {
	constructor(private readonly mailerService: MailerService) {}

	@OnEvent('email.recovery.password')
	// async sendPasswordRecoveryEmail(args: { to: string }) {
	// 	console.log(args);
	// 	const { to } = args;
	//
	// 	const subject = `Technogral. Password recovery`;
	//
	// 	await this.mailerService.sendMail({
	// 		to,
	// 		subject,
	// 		template: './recoveryPassword',
	// 	});
	// }

	// async sendPasswordRecoveryEmail(args: { to: string; link: string; name: string }) {
	// 	const { to, link, name } = args;
	//
	// 	const subject = 'Password Recovery';
	//
	// 	await this.mailerService.sendMail({
	// 		to,
	// 		subject,
	// 		template: './recoveryPassword',
	// 		context: {
	// 			name,
	// 			link,
	// 		},
	// 	});
	// }
	async sendPasswordRecoveryEmail(email: string, message: string) {
		const subject = 'Password Recovery';

		await this.mailerService.sendMail({
			from: 'Pavel <yournobodu@gmail.com>',
			to: email,
			subject,
			html: message,
		});
	}

	async sendBosterForm(email: string, message: string) {
		const subject = 'Новый заказ бустера';

		await this.mailerService.sendMail({
			from: 'Pavel <yournobodu@gmail.com>', // Укажите ваш email
			to: email,
			subject,
			html: message,
		});
	}
}
