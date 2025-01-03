import { TNullable } from '../../types/advanced.types';

const TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
const defaultTimestamp = () => TIMESTAMP;

export enum UserRoles {
	NEWBEE,
	AMATEUR,
	EXPERIENCED,
	EXPERT,
	SPECIALIST,
	ADMIN,
	AUTHOR,
}

export enum Genders {
	NOT_SPECIFIED,
	MAN,
	WOMAN,
}

export abstract class UserEntity {
	id: string;
	login: string;
	password: string;
	nickname: TNullable<string>;
	avatar: TNullable<string>;
	birthday: TNullable<Date>;
	gender: string;
	role: UserRoles;
	email: string;
	likes: number;
	dislikes: number;
	userRank: number;
	resetPasswordToken: string;
	resetPasswordExpires: Date;
	resetEmailToken: string;
	resetEmailExpires: Date;
	createdAt: Date;
	updatedAt: TNullable<Date>;
}
