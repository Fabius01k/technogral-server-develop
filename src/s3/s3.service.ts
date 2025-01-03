import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

	async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
		const key = `${folder}/${uuid()}-${file.originalname}`;

		await this.s3.send(
			new PutObjectCommand({
				Bucket: S3Config.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			})
		);

		return `https://s3.timeweb.cloud/${S3Config.bucketName}/${key}`;
	}

	async deleteFile(fileUrl: string): Promise<void> {
		const key = fileUrl.split(`${S3Config.bucketName}.storage.timeweb.cloud.net/`)[1];
		if (!key) throw new Error('Некорректный URL файла');

		await this.s3.send(
			new DeleteObjectCommand({
				Bucket: S3Config.bucketName,
				Key: key,
			})
		);
	}
}
