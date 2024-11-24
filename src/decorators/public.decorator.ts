import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC_FOR_AUTH_GUARD';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
