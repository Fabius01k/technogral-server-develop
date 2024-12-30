import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { comparePasswords, getPasswordHash } from 'src/utils/password.utils';
import { AuthLoginDto, AuthRegisterDto, AuthResponse } from './auth.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { JWT_CONFIG } from './auth.constants';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async login({ emailOrNickname, password }: AuthLoginDto, response: Response): Promise<AuthResponse> {
		const user = await this.usersService.getByEmailOrNickname(emailOrNickname);

		if (!user) {
			throw new NotFoundException('Пользователя с таким никнеймом или email не найдено');
		}

		const isPasswordValid = await comparePasswords(password, user.password);
		if (!isPasswordValid) {
			throw new BadRequestException('Неверный никнейм, email или пароль');
		}

		return this._getPayload(user, response);
	}

	async logout(response: Response): Promise<{ message: string }> {
		response.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		});

		return { message: 'Вы успешно вышли из системы' };
	}

	async register({ email, password }: AuthRegisterDto, response: Response): Promise<AuthResponse> {
		const user = await this.usersService.getByEmail(email);

		if (user) {
			throw new ConflictException('Такой пользователь уже существует');
		}

		const hash = await getPasswordHash(password);

		const newUser = await this.usersService.createUser({
			email,
			password: hash,
		});

		if (!newUser) {
			throw new BadRequestException();
		}

		return this._getPayload(newUser, response);
	}

	async refresh(request: Request, response: Response): Promise<AuthResponse> {
		const refreshToken = request.cookies['refreshToken'];

		if (!refreshToken) {
			throw new ForbiddenException();
		}

		const payload = await this.jwtService.verifyAsync(refreshToken, {
			secret: JWT_CONFIG.secret,
		});

		if (!payload) {
			throw new ForbiddenException();
		}

		const user = await this.usersService.getById(payload.id);
		if (!user) {
			throw new ForbiddenException();
		}

		return this._getPayload(user, response);
	}

	_getPayload(user: UserEntity, response: Response) {
		const payload = { id: user.id, nickname: user.nickname };

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: JWT_CONFIG.expiresIn,
		});

		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: JWT_CONFIG.refreshExpiresIn,
		});

		response.cookie('refreshToken', refreshToken, {
			httpOnly: true,
		});

		return {
			...user,
			accessToken,
		};
	}
}
