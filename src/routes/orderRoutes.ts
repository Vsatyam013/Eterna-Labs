import { FastifyInstance } from 'fastify';
import { OrderController } from '../controllers/orderController';
import { redisSub } from "../redis/index";

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.post('/execute', OrderController.executeOrder);

    fastify.get('/ws', { websocket: true }, (connection, req) => {
        const handler = (channel: any, message: any) => {
            connection.socket.send(message);
        };

        redisSub.on("message", handler);

        connection.socket.on("close", () => {
            redisSub.off("message", handler);
        })

        // connection.socket.send(JSON.stringify({ connected: true }));
    });

    redisSub.subscribe("order-updates");
}
