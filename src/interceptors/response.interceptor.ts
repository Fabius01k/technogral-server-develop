import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { format } from 'date-fns';
import { Reflector } from '@nestjs/core';
import {
	RESPONSE_MESSAGE_ERROR_METADATA_KEY,
	RESPONSE_MESSAGE_SUCCESS_METADATA_KEY,
} from '../decorators/responseMessage.decorator';

export type Response<T> = {
	status: boolean;
	statusCode: number;
	path: string;
	message: string;
	data: T;
	timestamp: string;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	constructor(private readonly reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		return next.handle().pipe(
			map((res: unknown) => this.responseHandler(res, context)),
			catchError((err: HttpException) => throwError(() => this.errorHandler(err, context)))
		);
	}

	errorHandler(exception: HttpException, context: ExecutionContext) {
		const ctx = context.switchToHttp();

		const response = ctx.getResponse();
		const request = ctx.getRequest();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const reflectMessage = this.reflector.get<string>(RESPONSE_MESSAGE_ERROR_METADATA_KEY, context.getHandler());
		const message = reflectMessage || exception.message;

		response.status(status).json({
			status: false,
			statusCode: status,
			path: request.url,
			message,
			result: exception,
			timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
		});
	}

	responseHandler(res: any, context: ExecutionContext) {
		const ctx = context.switchToHttp();

		console.log(ctx);

		const response = ctx.getResponse();
		const request = ctx.getRequest();
		const statusCode = response.statusCode;

		const reflectMessage = this.reflector.get<string>(RESPONSE_MESSAGE_SUCCESS_METADATA_KEY, context.getHandler());
		const message = reflectMessage || 'success';

		return {
			status: true,
			path: request.url,
			statusCode,
			message,
			data: res,
			timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
		};
	}
}
