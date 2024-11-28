import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile } from "@nestjs/common";
import { CreateBoosterDto, CreateUserBoosterDto, UpdateBoosterDto } from './boosters.dto';
import { BoostersService } from './booster.service';
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('boosters')
export class BoostersController {
	constructor(private readonly boostersService: BoostersService) {}

	@Get()
	findAllBusters() {
		return this.boostersService.findAllBusters();
	}

	@Post()
	createBuster(@Body() createBoosterDto: CreateBoosterDto) {
		return this.boostersService.createBuster(createBoosterDto);
	}

	@Put('/:id')
	updateBuster(@Param('id') id: string, @Body() updateBoosterDto: UpdateBoosterDto) {
		return this.boostersService.updateBuster(id, updateBoosterDto);
	}

	@Delete('/:id')
	deleteBuster(@Param('id') id: string) {
		return this.boostersService.deleteBuster(id);
	}

	@Post('order')
	orderBooster(@Body() createUserBoosterDto: CreateUserBoosterDto) {
		return this.boostersService.orderBooster(createUserBoosterDto);
	}

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
