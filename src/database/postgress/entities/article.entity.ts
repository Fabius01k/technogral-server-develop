import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { ArticleEntity, ArticleTags } from '../../../core/entities/article.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { ArticleUserReaction } from "./article.userReaction";

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity()
export class Article extends ArticleEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	title: string;

	@Column()
	previewImage: string;

	@Column({ enum: ArticleTags, nullable: true, default: null })
	tag: ArticleTags;

	@ManyToOne(() => User, (user) => user.articles)
	@JoinColumn({ name: 'authorId' })
	author: User;

	@OneToMany(() => Comment, (comment) => comment.article)
	comments: Comment[];

	@OneToMany(() => ArticleUserReaction, (reaction) => reaction.article)
	reactions: ArticleUserReaction[];

	@Column({ default: 0 })
	viewers: number;

	@Column({ type: 'text' })
	content: string;

	@Column({ default: 0 })
	likes: number;

	@Column({ default: 0 })
	dislikes: number;

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	readonly createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: true, default: null, onUpdate: TIMESTAMP })
	updatedAt: Date;
}
