import { TNullable } from '../../types/advanced.types';

export abstract class CommentEntity {
	id: string;
	authorId: number;
	articleId: number;
	text: string;
	likes: number;
	dislikes: number;
	createdAt: Date;
	updatedAt: TNullable<Date>;
}

export enum ReactionTypes {
	LIKE = 'like',
	DISLIKE = 'dislike',
}