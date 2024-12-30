import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { levelRequirements, User } from '../database/postgress/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, TChangePasswordDto, UpdateUserDto } from './users.dto';
import { TypedEventEmitterService } from '../eventEmitter/typedEventEmitter.service';
import { comparePasswords, getPasswordHash } from '../utils/password.utils';
import { randomBytes } from 'crypto';
import { EMailService } from '../mailer/mailer.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly eventEmitter: TypedEventEmitterService,
		private readonly eMailService: EMailService,
		private readonly s3Service: S3Service
	) {}

	async getAllUsers() {
		return await this.userRepository.find();
	}

	async getById(userId: string) {
		return await this.userRepository.findOneBy({ id: userId });
	}

	async getByEmail(email: string) {
		return await this.userRepository.findOneBy({ email });
	}

	async getByEmailOrNickname(emailOrNickname: string) {
		return await this.userRepository
			.createQueryBuilder('User')
			.where('User.email = :emailOrNickname OR User.nickname = :emailOrNickname', {
				emailOrNickname,
			})
			.getOne();
	}

	async createUser(userData: CreateUserDto) {
		const newUser = this.userRepository.create(userData);

		return await this.userRepository.save(newUser).catch((e) => {
			if (/(email)[\s\S]+(already exists)/.test(e.detail)) {
				throw new BadRequestException('Account with this email already exists.');
			}
			if (/(logib)[\s\S]+(already exists)/.test(e.detail)) {
				throw new BadRequestException('Account with such a login already exists.');
			}
			throw e;
		});
	}

	async getUserById(userId: string) {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new NotFoundException('Пользователь не найден');

		console.log(user, 'user');

		return user;
	}

	async deleteUser(userId: string) {
		return await this.userRepository.delete({ id: userId });
	}

	async updateUser(userId: string, userDto: UpdateUserDto) {
		return await this.userRepository.update({ id: userId }, userDto);
	}

	async changePassword(userId: string, { password, newPassword }: TChangePasswordDto): Promise<{ message: string }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		const isPasswordValid = await comparePasswords(password, user.password);
		if (!isPasswordValid) {
			throw new BadRequestException('Неверный текущий пароль');
		}

		const hash = await getPasswordHash(newPassword);

		await this.userRepository.update({ id: userId }, { password: hash });

		return { message: 'Пароль успешно изменён' };
	}

	async forgotPassword(email: string) {
		const user = await this.userRepository.findOneBy({ email: email });

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		const resetToken = randomBytes(32).toString('hex');
		const resetTokenExpires = new Date();
		resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

		await this.userRepository.update(
			{ id: user.id },
			{
				resetPasswordToken: resetToken,
				resetPasswordExpires: resetTokenExpires,
			}
		);

		// const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
		// console.log(2222);
		//
		// await this.eMailService.sendPasswordRecoveryEmail({
		// 	to: email,
		// 	link: resetLink,
		// 	name: user.nickname,
		// });

		const message = `<h1>Password recovery</h1>
        <p>Password recovery code, specify it when entering a new password - ${resetToken}
            <a href='https://your-app.com/reset-password?token=${resetToken}'></a>
        </p>`;

		await this.eMailService.sendPasswordRecoveryEmail(email, message);

		return { message: 'Password recovery email sent successfully' };
	}

	async changeEmailRequest(id: string) {
		const user = await this.userRepository.findOneBy({ id: id });

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		const resetToken = randomBytes(32).toString('hex');
		const resetTokenExpires = new Date();
		resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

		await this.userRepository.update(
			{ id: user.id },
			{
				resetEmailToken: resetToken,
				resetEmailExpires: resetTokenExpires,
			}
		);

		// const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
		// console.log(2222);
		//
		// await this.eMailService.sendPasswordRecoveryEmail({
		// 	to: email,
		// 	link: resetLink,
		// 	name: user.nickname,
		// });

		const message = `<h1>Password recovery</h1>
        <p>The code for changing the mail, specify it when entering a new mail. - ${resetToken}
            <a href='https://your-app.com/reset-password?token=${resetToken}'></a>
        </p>`;

		await this.eMailService.sendPasswordRecoveryEmail(user.email, message);

		return { message: 'Email change email sent successfully' };
	}

	async resetPassword(token: string, newPassword: string) {
		const user = await this.userRepository.findOneBy({ resetPasswordToken: token });

		if (!user || new Date() > user.resetPasswordExpires) {
			throw new Error('Invalid or expired token');
		}
		const hash = await getPasswordHash(newPassword);

		await this.userRepository.update(
			{ id: user.id },
			{
				password: hash,
				resetPasswordToken: null,
				resetPasswordExpires: null,
			}
		);

		return { message: 'Password updated successfully' };
	}

	async changeEmail(email: string, token: string) {
		const user = await this.userRepository.findOneBy({ resetEmailToken: token });

		if (!user || new Date() > user.resetEmailExpires) {
			throw new Error('Invalid or expired token');
		}

		await this.userRepository.update(
			{ id: user.id },
			{
				email: email,
				resetEmailToken: null,
				resetEmailExpires: null,
			}
		);

		return { message: 'Email updated successfully' };
	}

	async uploadAvatar(userId: string, file: Express.Multer.File, folder: string) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		if (user.avatar) {
			await this.s3Service.deleteFile(user.avatar);
		}

		const avatarUrl = await this.s3Service.uploadFile(file, folder);

		user.avatar = avatarUrl;
		await this.userRepository.save(user);

		return avatarUrl;
	}

	async checkAndUpdateUserLevel(userId: string) {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		const currentLevel = user.level;

		const maxLevel = Math.max(...levelRequirements.map((req) => req.level));
		if (currentLevel >= maxLevel) {
			return;
		}

		const nextLevel = levelRequirements.find((req) => req.level === currentLevel + 1);

		if (!nextLevel) {
			return;
		}

		if (
			user.articlesCount >= nextLevel.articles &&
			user.likesReceivedCount >= nextLevel.likes &&
			user.commentsReceivedCount >= nextLevel.comments
		) {
			user.level++;

			await this.userRepository.save(user);

			console.log(`Пользователь достиг уровня ${user.level}`);
		}
	}

	async generateLinks(
		userId: string,
		host: string,
		protocol: string
	): Promise<{ permanentLink: string; shortLink: string }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const baseUrl = `${protocol || 'http'}://${host}`;
		const permanentLink = `${baseUrl}/members/${user.id}`;
		const shortLink = `${baseUrl}/u/${this.generateShortCode()}`;

		user.permanentLink = permanentLink;
		user.shortLink = shortLink;

		await this.userRepository.save(user);

		return { permanentLink, shortLink };
	}

	async findByShortLink(shortCode: string): Promise<User | null> {
		const shortLink = `/u/${shortCode}`;
		console.log(shortLink, "shortLink");
		const user = await this.userRepository.findOne({ where: { shortLink } });
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	private generateShortCode(): string {
		return Math.random().toString(36).substring(2, 10);
	}
}
