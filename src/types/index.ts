export enum OrderStatus {
    PENDING = 'pending',
    ROUTING = 'routing',
    BUILDING = 'building',
    SUBMITTED = 'submitted',
    CONFIRMED = 'confirmed',
    FAILED = 'failed'
}

export interface Order {
    id: string;
    tokenIn: string;
    tokenOut: string;
    amount: number;
    type: 'market' | 'limit' | 'sniper';
    status: OrderStatus;
    txHash?: string;
    error?: string;
    createdAt: Date;
}

export interface Quote {
    dex: 'Raydium' | 'Meteora';
    price: number;
    fee: number;
}

export interface OrderRequest {
    tokenIn: string;
    tokenOut: string;
    amount: number;
    type?: 'market'; // Default to market for now
}
