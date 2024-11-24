import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_SUCCESS_METADATA_KEY = 'RESPONSE_MESSAGE_SUCCESS_METADATA_KEY';
export const RESPONSE_MESSAGE_ERROR_METADATA_KEY = 'RESPONSE_MESSAGE_ERROR_METADATA_KEY';

export const ResponseMessageSuccess = (message: string) => {
	return SetMetadata(RESPONSE_MESSAGE_SUCCESS_METADATA_KEY, message);
};

export const ResponseMessageError = (message: string) => {
	return SetMetadata(RESPONSE_MESSAGE_ERROR_METADATA_KEY, message);
};
