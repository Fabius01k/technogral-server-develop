import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Booster } from '../database/postgress/entities/booster.entity';
import { UserBooster } from '../database/postgress/entities/usersBooster.entity';
import { CreateBoosterDto, CreateUserBoosterDto, UpdateBoosterDto } from './boosters.dto';
import { S3Service } from '../s3/s3.service';
import { User } from '../database/postgress/entities/user.entity';
import { EMailService } from '../mailer/mailer.service';

@Injectable()
export class BoostersService {
	constructor(
		@InjectRepository(Booster)
		private boosterRepository: Repository<Booster>,
		@InjectRepository(UserBooster)
		private userBoosterRepository: Repository<UserBooster>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly eMailService: EMailService,
		private readonly s3Service: S3Service
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

	async orderBooster(createUserBoosterDto: CreateUserBoosterDto, userId: string) {
		const { boosterIds, processor, videoCard, motherboard, ram, case: pcCase, cooling } = createUserBoosterDto;

		const user = await this.userRepository.findOne({
			where: { id: userId },
			select: ['email', 'nickname'],
		});

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		const boosters = await this.boosterRepository.findBy({
			id: In(boosterIds),
		});

		const boosterNames = boosters.map((booster) => booster.name);

		const userBooster = this.userBoosterRepository.create({
			user: { id: userId },
			boosterIds,
			status: 'in progress',
			processor,
			videoCard,
			motherboard,
			ram,
			case: pcCase,
			cooling,
		});

		await this.userBoosterRepository.save(userBooster);

		const message = `
        <h1>Новый заказ от пользователя ${user.nickname || 'Без имени'}</h1>
        <p>Email: ${user.email}</p>
        <p>Процессор: ${processor}</p>
        <p>Видеокарта: ${videoCard}</p>
        <p>Материнская плата: ${motherboard}</p>
        <p>Оперативная память: ${ram}</p>
        <p>Корпус: ${pcCase}</p>
        <p>Охлаждение: ${cooling}</p>
        <h2>Список бустеров:</h2>
        <ul>
            ${boosterNames.map((name) => `<li>${name}</li>`).join('')}
        </ul>
    `;

		await this.eMailService.sendBosterForm('destroer13388@gmail.com', message);

		return userBooster;
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
