import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Config } from './s3.config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
	private readonly s3: S3Client;

	constructor() {
		this.s3 = new S3Client({
			region: S3Config.region,
			credentials: S3Config.credentials,
			endpoint: S3Config.endpoint,
			forcePathStyle: true,
		});
	}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		const key = `avatars/${uuid()}-${file.originalname}`;

		await this.s3.send(
			new PutObjectCommand({
				Bucket: S3Config.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			})
		);

		return `https://${S3Config.bucketName}.storage.yandexcloud.net/${key}`;
	}
}
