import { Worker } from 'bullmq';
import { DexRouter } from '../services/dexRouter';
import { Order, OrderStatus } from '../types';
import Redis from 'ioredis';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379')
};

const redis = new Redis(redisConfig);
const dexRouter = new DexRouter();

const worker = new Worker('order-queue', async job => {
    const order = job.data as Order;
    console.log(`Processing order ${order.id}`);

    const publishUpdate = async (status: OrderStatus, data?: any) => {
        const message = JSON.stringify({ orderId: order.id, status, ...data });
        await redis.publish('order-updates', message);
        // Update DB
        await query('UPDATE orders SET status = $1 WHERE id = $2', [status, order.id]);
    };

    try {
        await publishUpdate(OrderStatus.ROUTING);
        const quote = await dexRouter.getBestQuote(order.tokenIn, order.tokenOut, order.amount);
        console.log(`Best quote from ${quote.dex}: ${quote.price}`);

        await publishUpdate(OrderStatus.BUILDING, { quote });

        // Simulate building transaction time
        await new Promise(resolve => setTimeout(resolve, 500));

        await publishUpdate(OrderStatus.SUBMITTED);
        const txHash = await dexRouter.executeSwap(quote.dex, order.tokenIn, order.tokenOut, order.amount);

        await publishUpdate(OrderStatus.CONFIRMED, { txHash });
        await query('UPDATE orders SET tx_hash = $1 WHERE id = $2', [txHash, order.id]);

    } catch (error: any) {
        console.error(`Order ${order.id} failed:`, error);
        await publishUpdate(OrderStatus.FAILED, { error: error.message });
        await query('UPDATE orders SET error = $1 WHERE id = $2', [error.message, order.id]);
    }
}, {
    connection: redisConfig
});

console.log('Worker started');
