import { FastifyInstance } from 'fastify';
import { OrderController } from '../controllers/orderController';
import Redis from 'ioredis';

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.post('/execute', OrderController.executeOrder);

    fastify.get('/ws', { websocket: true }, (connection, req) => {
        const redisSub = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379')
        });

        connection.socket.on('message', (message) => {
            connection.socket.send('Connected to Order Status Stream');
        });

        redisSub.subscribe('order-updates', (err, count) => {
            if (err) console.error('Failed to subscribe: %s', err.message);
        });

        redisSub.on('message', (channel, message) => {
            connection.socket.send(message);
        });

        connection.socket.on('close', () => {
            redisSub.disconnect();
        });
    });
}
