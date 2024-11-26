import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
	ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseMessageSuccess } from '../decorators/responseMessage.decorator';
import { ChangePasswordDto, CreateUserDto, ForgotPasswordDto, UpdateUserDto } from './users.dto';
import { Public } from '../decorators/public.decorator';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { S3Service } from '../s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('members')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly s3Service: S3Service
	) {}

	@Public()
	@Get('/')
	@ResponseMessageSuccess('Success. Got all users')
	async getAll() {
		return await this.usersService.getAll();
	}

	@Get('/:userId')
	@ResponseMessageSuccess('Success. Got user by ID')
	async getById(@Param('userId') userId: string) {
		const isExisted = await this.usersService.checkWhetherUserExists(userId);

		if (!isExisted) {
			throw new HttpException(
				{
					status: HttpStatus.NOT_FOUND,
					error: 'User does not exist',
				},
				HttpStatus.NOT_FOUND
			);
		}

		return this.usersService.getById(userId);
	}

	@Post('/create')
	@ResponseMessageSuccess('User created successfully')
	async create(@Body(new ValidationPipe()) userDto: CreateUserDto) {
		return this.usersService.create(userDto);
	}

	@Post('/reset-password')
	async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
		return this.usersService.resetPassword(token, newPassword);
	}

	@Post('/:userId/avatar')
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new Error('Файл не прикреплен');
		}

		const avatarUrl = await this.s3Service.uploadFile(file);

		await this.usersService.updateAvatar(userId, avatarUrl);

		return { message: 'Аватарка успешно загружена', avatarUrl };
	}

	@Put('/:userId')
	async update(@Param('userId') userId: string, @Body(new ValidationPipe()) userDto: UpdateUserDto) {
		return this.usersService.update(userId, userDto);
	}

	@Put('/:userId/change-password')
	async changePassword(@Param('userId') userId: string, @Body(new ValidationPipe()) passwords: ChangePasswordDto) {
		return this.usersService.changePassword(userId, passwords);
	}

	@Put('/:userId/forgot-password')
	async forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto) {
		return this.usersService.forgotPassword(forgotPasswordDto.email);
	}

	@Delete('/:userId')
	async delete(@Param('userId') userId: string) {
		return this.usersService.delete(userId);
	}
}
