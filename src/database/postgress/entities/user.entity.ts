import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Genders, UserEntity, UserRoles } from '../../../core/entities/user.entity';
import { Article } from './article.entity';
import { Comment } from './comment.entity';
import { CommentUserReaction } from "./comment.userReaction";
import { ArticleUserReaction } from "./article.userReaction";

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

	@Column({ nullable: true, unique: true })
	nickname: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	birthday: Date;

	@Column({ nullable: true })
	avatar: string;

	@Column({ enum: Genders, default: Genders.NOT_SPECIFIED })
	gender: Genders;

	@Column({ enum: UserRoles, default: UserRoles.NEWBEE })
	role: UserRoles;

	@Column({ default: 0 })
	likes: number;

	@Column({ default: 0 })
	dislikes: number;

	@Column({ default: 0 })
	userRank: number;

	@Column({ nullable: true })
	resetPasswordToken: string;

	@Column({ type: 'timestamp', nullable: true })
	resetPasswordExpires: Date;

	@OneToMany(() => Article, (article) => article.author)
	articles: Article[];

	@OneToMany(() => Comment, ({ authorId }) => authorId)
	comments: Comment[];

	@OneToMany(() => Comment, (comment) => comment.wallOwner)
	wallComments: Comment[];

	@OneToMany(() => CommentUserReaction, (reaction) => reaction.user)
	commentReactions: CommentUserReaction[];

	@OneToMany(() => ArticleUserReaction, (reaction) => reaction.user)
	articleReactions: ArticleUserReaction[];

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: true, default: null, onUpdate: TIMESTAMP })
	updatedAt: Date;
}
