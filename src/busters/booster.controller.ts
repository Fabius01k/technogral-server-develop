import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Put,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	Request,
} from '@nestjs/common';
import { CreateBoosterDto, CreateUserBoosterDto, UpdateBoosterDto } from './boosters.dto';
import { BoostersService } from './booster.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('boosters')
export class BoostersController {
	constructor(private readonly boostersService: BoostersService) {}

	@Get()
	findAllBusters() {
		return this.boostersService.findAllBusters();
	}

	@UseGuards(AuthGuard)
	@Post()
	createBuster(@Body() createBoosterDto: CreateBoosterDto) {
		return this.boostersService.createBuster(createBoosterDto);
	}

	@UseGuards(AuthGuard)
	@Put('/:id')
	updateBuster(@Param('id') id: string, @Body() updateBoosterDto: UpdateBoosterDto) {
		return this.boostersService.updateBuster(id, updateBoosterDto);
	}

	@UseGuards(AuthGuard)
	@Delete('/:id')
	deleteBuster(@Param('id') id: string) {
		return this.boostersService.deleteBuster(id);
	}

	// @UseGuards(AuthGuard)
	// @Post('order')
	// orderBooster(@Body() createUserBoosterDto: CreateUserBoosterDto) {
	// 	return this.boostersService.orderBooster(createUserBoosterDto);
	// }

	@UseGuards(AuthGuard)
	@Post('order-req')
	reqOrderBooster(@Request() req: Request, @Body() createUserBoosterDto: CreateUserBoosterDto) {
		const userId = req['userId'];
		return this.boostersService.orderBooster(createUserBoosterDto, userId);
	}

	@UseGuards(AuthGuard)
	@Post('/:boosterId/upload-image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadBoosterImage(@Param('boosterId') boosterId: string, @UploadedFile() file: Express.Multer.File) {
		if (!file) {
			throw new Error('Файл не прикреплен');
		}

		const url = await this.boostersService.uploadBoosterImage(boosterId, file, 'boosters-images');

		return { message: 'Фото успешно загружено', url };
	}
}
