import { Comment } from '../database/postgress/entities/comment.entity';
import { Article } from '../database/postgress/entities/article.entity';

export function mapCommentWithReplies(comment: Comment): any {
	return {
		id: comment.id,
		text: comment.text,
		likes: comment.likes,
		dislikes: comment.dislikes,
		createdAt: comment.createdAt,
		updatedAt: comment.updatedAt,
		author: {
			id: comment.author.id,
			nickname: comment.author.nickname,
			avatar: comment.author.avatar,
		},
		replies: comment.replies ? comment.replies.map(mapCommentWithReplies) : [],
	};
}

export function mapArticleWithComments(article: Article): any {
	return {
		id: article.id,
		title: article.title,
		previewImage: article.previewImage,
		content: article.content,
		likes: article.likes,
		dislikes: article.dislikes,
		createdAt: article.createdAt,
		author: {
			id: article.author?.id,
			nickname: article.author?.nickname,
			avatar: article.author?.avatar,
		},
		comments: article.comments ? article.comments.map(mapCommentWithReplies) : [],
	};
}
