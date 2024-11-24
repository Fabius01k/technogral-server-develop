import { TNullable } from '../../../types/advanced.types';
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
import { User } from './user.entity';
import { Article } from './article.entity';
import { CommentEntity } from '../../../core/entities/comment.entity';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity()
export class Comment extends CommentEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	text: string;

	@Column({ default: 0 })
	likes: number;

	@Column({ default: 0 })
	dislikes: number;

	@ManyToOne(() => User, (user) => user.comments, { nullable: false })
	@JoinColumn({ name: 'authorId' })
	author: User;

	@ManyToOne(() => User, (user) => user.wallComments, { nullable: true })
	@JoinColumn({ name: 'wallOwnerId' })
	wallOwner: User;

	@ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
	@JoinColumn({ name: 'parentCommentId' })
	parentComment: Comment;

	@OneToMany(() => Comment, (comment) => comment.parentComment)
	replies: Comment[];

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP(6)' })
	updatedAt: Date | null;
}
