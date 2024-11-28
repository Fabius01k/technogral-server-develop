import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Booster } from './booster.entity';
import { User } from './user.entity';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity('user_boosters')
export class UserBooster {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Booster)
	@JoinColumn({ name: 'boosterId' })
	booster: Booster;

	@Column({ default: 'in progress' })
	status: string;

	@CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
