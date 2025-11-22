import { Queue } from 'bullmq';
import { Order } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379')
};

console.log('OrderQueue Redis Connection:', connection);

export class OrderQueue {
    private queue: Queue;

    constructor() {
        this.queue = new Queue('order-queue', { connection });
    }

    async add(order: Order): Promise<void> {
        console.log(`Adding order ${order.id} to queue`);
        await this.queue.add('process-order', order, {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        });
    }
}
