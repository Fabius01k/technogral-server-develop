import * as bcrypt from 'bcrypt';

export const getPasswordHash = (password: string) => {
	const rounds = 10; // TODO: Вынести в конфиг
	return bcrypt.hash(password, rounds);
};

export const comparePasswords = (password: string, passwordHash: string) => {
	return bcrypt.compare(password, passwordHash);
};
