import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderRequest, Order, OrderStatus } from '../types';
import { DexRouter } from '../services/dexRouter';
import { OrderQueue } from '../queues/orderQueue';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const dexRouter = new DexRouter();
const orderQueue = new OrderQueue();

export class OrderController {
    static async executeOrder(req: FastifyRequest<{ Body: OrderRequest }>, reply: FastifyReply) {
        const { tokenIn, tokenOut, amount } = req.body;

        const orderId = uuidv4();
        const order: Order = {
            id: orderId,
            tokenIn,
            tokenOut,
            amount,
            type: 'market',
            status: OrderStatus.PENDING,
            createdAt: new Date(),
        };

        if (!tokenIn || !tokenOut || !amount) {
            return reply.status(400).send({ error: 'Missing required fields' });
        }

        try {
            await query(
                'INSERT INTO orders (id, token_in, token_out, amount, status) VALUES ($1, $2, $3, $4, $5)',
                [order.id, order.tokenIn, order.tokenOut, order.amount, order.status]
            );
        } catch (err) {
            console.error(err);
            return reply.status(500).send({ error: 'Database error' });
        }

        await orderQueue.add(order);

        return reply.send({ orderId, status: OrderStatus.PENDING, message: 'Order received and queued' });
    }
}
