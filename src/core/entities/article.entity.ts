import { TNullable } from '../../types/advanced.types';

export abstract class ArticleEntity {
	id: string;
	title: string;
	previewImage: string;
	authorId: number;
	viewers: number;
	createdAt: Date;
	updatedAt: TNullable<Date>;
	tags: string[];
	content: string;
}
