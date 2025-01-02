import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	ValidationPipe,
	Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangeEmailDto, ChangePasswordDto, CreateUserDto, ForgotPasswordDto, UpdateUserDto } from './users.dto';
import { Public } from '../decorators/public.decorator';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('members')
// @UseInterceptors(ResponseInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Public()
	@Get('/')
	async getAllUsers() {
		return await this.usersService.getAllUsers();
	}

	@UseGuards(AuthGuard)
	@Get('/getInfo')
	async getUserInfo(@Request() req: Request) {
		const userId = req['userId'];
		const user = await this.usersService.getUserById(userId);

		const { password, resetPasswordToken, resetPasswordExpires, resetEmailToken, resetEmailExpires, ...userResponse } =
			user;
		return userResponse;
	}

	@Get('/:userId')
	async getUserById(@Param('userId') userId: string) {
		return await this.usersService.getUserById(userId);
	}

	@Get(':userId/progress')
	async getUserProgress(@Param('userId') userId: string) {
		return this.usersService.getUserProgress(userId);
	}

	@UseGuards(AuthGuard)
	@Post('/create')
	async createUser(@Body(new ValidationPipe()) userDto: CreateUserDto) {
		return this.usersService.createUser(userDto);
	}

	@UseGuards(AuthGuard)
	@Post('/reset-password')
	async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
		return this.usersService.resetPassword(token, newPassword);
	}

	@UseGuards(AuthGuard)
	@Post('/:userId/upload-avatar')
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new Error('Файл не прикреплен');
		}

		const url = await this.usersService.uploadAvatar(userId, file, 'avatars');

		return { message: 'Аватарка успешно загружена', url };
	}

	@UseGuards(AuthGuard)
	@Put('/:userId')
	async updateUser(@Param('userId') userId: string, @Body(new ValidationPipe()) userDto: UpdateUserDto) {
		return this.usersService.updateUser(userId, userDto);
	}

	@UseGuards(AuthGuard)
	@Put('/:userId/change-password')
	async changePassword(@Param('userId') userId: string, @Body(new ValidationPipe()) passwords: ChangePasswordDto) {
		return this.usersService.changePassword(userId, passwords);
	}

	@UseGuards(AuthGuard)
	@Put('/:userId/change-email-req')
	async changeEmailRequest(@Param('userId') userId: string) {
		return this.usersService.changeEmailRequest(userId);
	}

	@UseGuards(AuthGuard)
	@Put('/:userId/forgot-password')
	async forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto) {
		return this.usersService.forgotPassword(forgotPasswordDto.email);
	}

	@UseGuards(AuthGuard)
	@Put('/:userId/change-email')
	async changeEmail(@Body(new ValidationPipe()) emailDto: ChangeEmailDto) {
		const { newEmail, token } = emailDto;
		return this.usersService.changeEmail(newEmail, token);
	}

	@UseGuards(AuthGuard)
	@Delete('/:userId')
	async deleteUser(@Param('userId') userId: string) {
		return this.usersService.deleteUser(userId);
	}

	@UseGuards(AuthGuard)
	@Post('/generate-links')
	async generateLinks(@Request() req: Request): Promise<{ permanentLink: string; shortLink: string }> {
		const userId = req['userId'];
		const host = req.headers['host'];
		const protocol = req.headers['x-forwarded-proto'] || 'http';
		return this.usersService.generateLinks(userId, host, protocol);
	}

	@Get('/u/:shortCode')
	async getUserByShortLink(@Param('shortCode') shortCode: string) {
		return await this.usersService.findByShortLink(shortCode);

	}
}
