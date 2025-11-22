import fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { orderRoutes } from './routes/orderRoutes';
import { initDb } from './db';
import Redis from 'ioredis';

const server = fastify({ logger: true });

server.register(websocket);
server.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
});

server.register(orderRoutes, { prefix: '/api/orders' });

const start = async () => {
    try {
        await initDb();
        await createTestRedis();
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server listening on http://localhost:3000');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

const createTestRedis = async () => {
    const redis = new Redis({
        host: 'redis',
        port: 6379
    });
    redis.set('testKey', 'testValue');
    redis.get('testKey', (err, value) => {
        console.log(err, value);
    });
}

start();
