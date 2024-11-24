import { Body, Controller, Post, HttpCode, HttpStatus, Res, Req, UseInterceptors } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './auth.dto';
import { Public } from 'src/decorators/public.decorator';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('login')
	login(@Body() dto: AuthLoginDto, @Res({ passthrough: true }) response: Response) {
		return this.authService.login(dto, response);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('register')
	register(@Body() dto: AuthRegisterDto, @Res({ passthrough: true }) response: Response) {
		return this.authService.register(dto, response);
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		return this.authService.refresh(request, response);
	}
}
