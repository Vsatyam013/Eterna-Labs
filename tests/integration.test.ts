import fastify from 'fastify';
import { orderRoutes } from '../src/routes/orderRoutes';
import { OrderController } from '../src/controllers/orderController';

// Mock dependencies
jest.mock('../src/queues/orderQueue');
jest.mock('../src/db', () => ({
    query: jest.fn(),
}));

describe('Order API Integration', () => {
    let server: any;

    beforeAll(async () => {
        server = fastify();
        server.register(orderRoutes, { prefix: '/api/orders' });
        await server.ready();
    });

    afterAll(() => {
        server.close();
    });

    it('should accept a valid order', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/api/orders/execute',
            payload: {
                tokenIn: 'SOL',
                tokenOut: 'USDC',
                amount: 1.0,
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.status).toBe('pending');
        expect(body.orderId).toBeDefined();
    });

    it('should reject an invalid order', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/api/orders/execute',
            payload: {
                tokenIn: 'SOL',
                // missing tokenOut
                amount: 1.0,
            },
        });

        expect(response.statusCode).toBe(400);
    });
});
