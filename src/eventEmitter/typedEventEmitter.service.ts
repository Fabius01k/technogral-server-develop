import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloads } from '../interfaces/eventTypes.interface';

@Injectable()
export class TypedEventEmitterService {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): boolean {
		return this.eventEmitter.emit(event, payload);
	}
}
