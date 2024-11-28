import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booster } from '../database/postgress/entities/booster.entity';
import { UserBooster } from '../database/postgress/entities/usersBooster.entity';
import { CreateBoosterDto, CreateUserBoosterDto, UpdateBoosterDto } from './boosters.dto';
import { S3Service } from "../s3/s3.service";

@Injectable()
export class BoostersService {
	constructor(
		@InjectRepository(Booster)
		private boosterRepository: Repository<Booster>,
		@InjectRepository(UserBooster)
		private userBoosterRepository: Repository<UserBooster>,
		private readonly s3Service: S3Service,
	) {}

	findAllBusters() {
		return this.boosterRepository.find();
	}

	async createBuster(createBoosterDto: CreateBoosterDto) {
		const { name, description, price, type } = createBoosterDto;

		const booster = this.boosterRepository.create({
			name,
			description,
			price,
			type,
		});

		const savedBooster = await this.boosterRepository.save(booster);

		return savedBooster;
	}

	async updateBuster(id: string, updateBoosterDto: UpdateBoosterDto) {
		const booster = await this.boosterRepository.preload({
			id,
			...updateBoosterDto,
		});

		if (!booster) {
			throw new NotFoundException('Бустер не найден');
		}

		return this.boosterRepository.save(booster);
	}

	async deleteBuster(id: string) {
		const deleteResult = await this.boosterRepository.delete(id);

		if (deleteResult.affected === 0) {
			throw new NotFoundException('Бустер не найден');
		}

		return true;
	}

	async orderBooster(createUserBoosterDto: CreateUserBoosterDto) {
		const { userId, boosterId } = createUserBoosterDto;

		const userBooster = this.userBoosterRepository.create({
			user: { id: userId },
			booster: { id: boosterId },
			status: 'in progress',
		});

		return this.userBoosterRepository.save(userBooster);
	}

	async uploadBoosterImage(boosterId: string, file: Express.Multer.File, folder: string): Promise<string> {
		const booster = await this.boosterRepository.findOne({ where: { id: boosterId } });
		if (!booster) {
			throw new NotFoundException('Бустер не найден');
		}

		if (booster.image) {
			await this.s3Service.deleteFile(booster.image);
		}

		const imageUrl = await this.s3Service.uploadFile(file, folder);

		booster.image = imageUrl;
		await this.boosterRepository.save(booster);

		return imageUrl;
	}
}
