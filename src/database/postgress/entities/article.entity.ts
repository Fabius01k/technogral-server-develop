import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { ArticleEntity } from '../../../core/entities/article.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';

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

	@ManyToOne(() => User, ({ articles }) => articles)
	@JoinTable({ name: 'authorId' })
	authorId: number;

	@OneToMany(() => Comment, ({ articleId }) => articleId)
	comments: Comment[];

	@Column({ default: 0 })
	viewers: number;

	@Column()
	content: string;

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	readonly createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: true, default: null, onUpdate: TIMESTAMP })
	updatedAt: Date;
}
