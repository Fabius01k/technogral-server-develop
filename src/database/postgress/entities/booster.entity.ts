import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

@Entity('boosters')
export class Booster {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column('text')
	description: string;

	@Column('decimal')
	price: number;

	@Column({ nullable: true, default: null })
	image: string;

	@Column()
	type: string;

  @CreateDateColumn({ type: 'timestamp', default: defaultTimestamp })
  createdAt: Date;
}
