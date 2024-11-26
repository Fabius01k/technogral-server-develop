import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/postgress/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, TChangePasswordDto, UpdateUserDto } from './users.dto';
import { TypedEventEmitterService } from '../eventEmitter/typedEventEmitter.service';
import { comparePasswords, getPasswordHash } from '../utils/password.utils';
import { randomBytes } from 'crypto';
import { EMailService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly eventEmitter: TypedEventEmitterService,
		private readonly eMailService: EMailService
	) {}

	async getAll() {
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

	async getByLogin(login: string) {
		return await this.userRepository.findOneBy({ login });
	}

	async create(userData: CreateUserDto) {
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

	async checkWhetherUserExists(userId: string): Promise<boolean> {
		const user = await this.userRepository.findOneBy({ id: userId });
		return !!user;
	}

	async delete(userId: string) {
		return await this.userRepository.delete({ id: userId });
	}

	async update(userId: string, userDto: UpdateUserDto) {
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

	async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) {
			throw new NotFoundException('User not found');
		}

		user.avatar = avatarUrl;
		await this.userRepository.save(user);
	}
}
