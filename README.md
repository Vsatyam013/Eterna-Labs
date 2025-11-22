# Order Execution Engine

## Overview
This is a backend engine for a cryptocurrency exchange that processes orders, routes them to the best DEX (Raydium vs Meteora) on Solana Devnet, and streams real-time status updates via WebSockets.

## Features
- **Real Devnet Execution**: Routes trades to Raydium or Meteora on Solana Devnet.
- **Order Queue**: Uses BullMQ and Redis to handle concurrent orders.
- **Real-time Updates**: WebSocket streaming of order status (Pending -> Routing -> Building -> Submitted -> Confirmed).
- **Persistence**: Stores order history in PostgreSQL.
- **Basic UI**: A simple frontend to submit orders and view logs.

## Prerequisites
- Node.js & npm
- Docker & Docker Compose
- Solana Devnet Wallet (Private Key)

## Architecture
The system is containerized using Docker Compose and consists of four main services:

1.  **App (`app`)**: The Fastify backend server.
    -   Exposes the HTTP API (`POST /api/orders/execute`) and WebSocket endpoint (`/api/orders/ws`).
    -   Serves the static frontend files.
    -   Producers orders to the Redis queue.
2.  **Worker (`worker`)**: A background processor.
    -   Consumes orders from the Redis queue.
    -   Handles DEX routing logic and Solana transactions.
    -   Updates order status in Postgres and publishes real-time updates to Redis Pub/Sub.
3.  **Redis (`redis`)**:
    -   Acts as the message broker for the job queue (BullMQ).
    -   Handles Pub/Sub for real-time WebSocket updates.
4.  **PostgreSQL (`postgres`)**:
    -   Persists order history and status.

## Setup & Running

### Prerequisites
- Docker & Docker Compose
- Solana Devnet Wallet (Private Key)

### 1. Environment Setup
Copy `.env.example` to `.env` and add your Solana Private Key.
```bash
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### 2. Run with Docker
The entire stack (App, Worker, Database, Redis) is managed via Docker Compose.

To build and start the application:
```bash
# Build and start all services
sudo docker-compose up -d --build
```

To view logs (useful for debugging):
```bash
# View logs for all services
sudo docker-compose logs -f

# View logs for a specific service
sudo docker-compose logs -f app
sudo docker-compose logs -f worker
```

To stop the application:
```bash
sudo docker-compose down
```

> **Note**: If you encounter permission errors, ensure you are running with `sudo` or have added your user to the `docker` group.

## Usage
- Open `http://localhost:3000` in your browser.
- Enter Token In (e.g., SOL), Token Out (e.g., USDC), and Amount.
- Click "Execute Order".
- Watch the "Live Updates" section for real-time status changes.

## API Endpoints
- `POST /api/orders/execute`: Submit an order.
- `WS /api/orders/ws`: WebSocket connection for order updates.

## Design Decisions

### Order Type: Market Order
We chose to implement **Market Orders** for this MVP because:
1.  **Simplicity**: It allows for immediate execution without complex state management for open orders.
2.  **User Experience**: It provides instant feedback to the user, which is ideal for demonstrating the real-time capabilities of the engine.
3.  **Devnet Constraints**: Liquidity on Devnet can be sporadic; market orders ensure execution (slippage aside) better than limit orders which might never fill.

### Scalability to Other Order Types
The current architecture is designed to be easily extensible:

-   **Limit Orders**:
    -   **Database**: Add `target_price` and `expiry` columns to the `orders` table.
    -   **Worker**: Create a separate `LimitOrderWorker` or a cron job that periodically checks off-chain prices (via Pyth or Chainlink) and triggers execution when conditions are met.
    -   **Queue**: Use a separate queue or delayed jobs in BullMQ to re-check orders.

-   **Sniper Orders**:
    -   **Trigger**: Implement a listener for new pool creation events on-chain (e.g., Raydium `LiquidityPoolV4` initialization).
    -   **Priority**: Use a high-priority queue in BullMQ for these orders.
    -   **Execution**: Integrate with Jito bundles (if on Mainnet) for guaranteed block inclusion.
