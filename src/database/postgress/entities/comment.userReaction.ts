import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { ReactionTypes } from '../../../core/entities/comment.entity';

@Entity()
export class CommentUserReaction {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User, (user) => user.commentReactions, { nullable: false })
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Comment, (comment) => comment.reactions, { nullable: false })
	@JoinColumn({ name: 'commentId' })
	comment: Comment;

	@Column({ type: 'enum', enum: ReactionTypes, nullable: false })
	type: ReactionTypes;

	@CreateDateColumn()
	createdAt: Date;
}
