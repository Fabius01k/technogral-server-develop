import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_boosters')
export class UserBooster {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({ type: 'jsonb', default: [] })
	boosterIds: string[];

	@Column({ default: 'in progress' })
	status: string;

	@Column({ nullable: true })
	processor: string;

	@Column({ nullable: true })
	videoCard: string;

	@Column({ nullable: true })
	motherboard: string;

	@Column({ nullable: true })
	ram: string;

	@Column({ nullable: true })
	case: string;

	@Column({ nullable: true })
	cooling: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
