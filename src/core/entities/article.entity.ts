import { TNullable } from '../../types/advanced.types';

export enum ArticleTags {
	GAMES = 'Игры и развлечения',
	IT = 'IT-технологии',
	AI = 'Искуственный интеллект',
	HARDWARE = 'ПК и комплектующие',
	PROGRAMMING = 'Программирование',
	DESIGN = 'Дизайн',
	DEVICES = 'Девайсы',
}

export abstract class ArticleEntity {
	id: string;
	title: string;
	previewImage: string;
	authorId: string;
	viewers: number;
	createdAt: Date;
	updatedAt: TNullable<Date>;
	tags: string[];
	content: string;
}
