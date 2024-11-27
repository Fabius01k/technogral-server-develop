import { config } from 'dotenv';
config();

// export const S3Config = {
// 	region: 'ru-1',
// 	bucketName: '05b0d28f-techo-gral-api',
// 	credentials: {
// 		accessKeyId: 'IG4QCIAIVRJGVPFODUS9',
// 		secretAccessKey: 'wuD0eI6DsnmPHu02D3xDXX7GdNUKzK4qxTVlAPIa',
// 	},
// 	endpoint: 'https://s3.timeweb.cloud',
// };

export const S3Config = {
	region: process.env.S3_REGION,
	bucketName: process.env.S3_BUCKET,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY,
		secretAccessKey: process.env.S3_SECRET_KEY,
	},
	endpoint: process.env.S3_ENDPOINT,
};
