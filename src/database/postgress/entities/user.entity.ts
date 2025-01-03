import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { UserEntity, UserRoles } from '../../../core/entities/user.entity';
import { Article } from './article.entity';
import { Comment } from './comment.entity';
import { CommentUserReactionEntity } from './comment.userReaction.entity';
import { ArticleUserReactionEntity } from './article.userReaction.entity';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity()
@Unique(['email', 'login'])
export class User extends UserEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	login: string;

	@Column({ unique: true, nullable: true })
	email: string;

	@Column({ nullable: true })
	nickname: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	birthday: Date;

	@Column({ nullable: true })
	avatar: string;

	@Column({ nullable: true })
	gender: string;

	@Column({ enum: UserRoles, default: UserRoles.NEWBEE })
	role: UserRoles;

	@Column({ default: 0 })
	likes: number;

	@Column({ default: 0 })
	dislikes: number;

	@Column({ default: 0 })
	level: number;

	@Column({ default: 0 })
	articlesCount: number;

	@Column({ default: 0 })
	likesReceivedCount: number;

	@Column({ default: 0 })
	commentsReceivedCount: number;

	@Column({ nullable: true })
	resetPasswordToken: string;

	@Column({ type: 'timestamp', nullable: true })
	resetPasswordExpires: Date;

	@Column({ nullable: true })
	resetEmailToken: string;

	@Column({ type: 'timestamp', nullable: true })
	resetEmailExpires: Date;

	@Column({ unique: true, nullable: true })
	permanentLink: string;

	@Column({ unique: true, nullable: true })
	shortLink: string;

	@Column({ nullable: true })
	occupation: string;

	@Column({ nullable: true })
	timezone: string;

	@Column({ nullable: true })
	interests: string;

	@OneToMany(() => Article, (article) => article.author)
	articles: Article[];

	@OneToMany(() => Comment, ({ authorId }) => authorId)
	comments: Comment[];

	@OneToMany(() => Comment, (comment) => comment.wallOwner)
	wallComments: Comment[];

	@OneToMany(() => CommentUserReactionEntity, (reaction) => reaction.user)
	commentReactions: CommentUserReactionEntity[];

	@OneToMany(() => ArticleUserReactionEntity, (reaction) => reaction.user)
	articleReactions: ArticleUserReactionEntity[];

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: true, default: null, onUpdate: TIMESTAMP })
	updatedAt: Date;
}

export const levelRequirements = [
	{ level: 1, articles: 10, likes: 20, comments: 50 },
	{ level: 2, articles: 25, likes: 50, comments: 100 },
	{ level: 3, articles: 50, likes: 100, comments: 200 },
	{ level: 4, articles: 100, likes: 200, comments: 500 },
	{ level: 5, articles: 200, likes: 500, comments: 1000 },
];
