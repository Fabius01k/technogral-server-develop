import { Global, Module } from '@nestjs/common';
import { TypedEventEmitterService } from './typedEventEmitter.service';

@Global()
@Module({
	providers: [TypedEventEmitterService],
	exports: [TypedEventEmitterService],
})
export class TypedEventEmitterModule {}
