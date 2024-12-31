import { TNullable } from '../../types/advanced.types';
import { Tag } from "../../database/postgress/entities/articleTag.entity";

export enum ArticleTags {
	GAMES = 'gamesAndEntertainment',
	IT = 'itTechnology',
	AI = 'artificialIntelligence',
	HARDWARE = 'pcAndComponents',
	PROGRAMMING = 'programming',
	DESIGN = 'design',
	DEVICES = 'devices',
}

export abstract class ArticleEntity {
	id: string;
	title: string;
	previewImage: string;
	authorId: string;
	viewers: number;
	createdAt: Date;
	updatedAt: TNullable<Date>;
	tags: Tag[];
	content: string;
}
