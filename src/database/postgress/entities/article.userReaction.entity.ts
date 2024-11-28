import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';
import { ReactionTypes } from '../../../core/entities/comment.entity';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity()
export class ArticleUserReactionEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User, (user) => user.articleReactions)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Article, (article) => article.reactions)
	@JoinColumn({ name: 'articleId' })
	article: Article;

	@Column({ type: 'enum', enum: ReactionTypes, nullable: false })
	type: ReactionTypes;

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	createdAt: Date;
}
