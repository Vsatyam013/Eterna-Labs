import { DexRouter } from '../src/services/dexRouter';

describe('DexRouter', () => {
    let dexRouter: DexRouter;

    beforeEach(() => {
        dexRouter = new DexRouter();
    });

    it('should return a quote with a valid DEX name', async () => {
        const quote = await dexRouter.getBestQuote('SOL', 'USDC', 1);
        expect(['Raydium', 'Meteora']).toContain(quote.dex);
    });

    it('should return a price greater than 0', async () => {
        const quote = await dexRouter.getBestQuote('SOL', 'USDC', 1);
        expect(quote.price).toBeGreaterThan(0);
    });

    it('should return a fee', async () => {
        const quote = await dexRouter.getBestQuote('SOL', 'USDC', 1);
        expect(quote.fee).toBeDefined();
    });
});
