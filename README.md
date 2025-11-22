# Order Execution Engine

A robust, containerized backend engine for executing cryptocurrency orders on Solana Devnet. This system processes market orders, routes them to the best DEX (Raydium vs. Meteora), and streams real-time status updates via WebSockets.

## Features

-   **Real Devnet Execution**: Simulates DEX routing and executes transactions on Solana Devnet.
-   **High Concurrency**: Handles 10+ concurrent orders using BullMQ and Redis.
-   **Resilience**: Implements exponential back-off retries for failed orders.
-   **Real-time Updates**: WebSocket streaming of order status (`pending` -> `routing` -> `building` -> `submitted` -> `confirmed`).
-   **Persistence**: Stores comprehensive order history in PostgreSQL.
-   **Dockerized**: Fully containerized setup for easy deployment.

## Tech Stack

-   **Runtime**: Node.js (TypeScript)
-   **Framework**: Fastify
-   **Queue**: BullMQ (Redis-backed)
-   **Database**: PostgreSQL
-   **Blockchain**: @solana/web3.js
-   **Infrastructure**: Docker & Docker Compose

## Architecture

The system is composed of four main Docker services:

1.  **App (`app`)**: Fastify server exposing the HTTP API and WebSocket endpoint. Producers orders to the queue.
2.  **Worker (`worker`)**: Background processor that consumes orders, handles DEX routing, executes transactions, and updates status.
3.  **Redis (`redis`)**: Message broker for the job queue and Pub/Sub channel for real-time updates.
4.  **PostgreSQL (`postgres`)**: Relational database for persisting order data.

## Project Structure

```
├── src
│   ├── controllers/ # Request handlers
│   ├── db/          # DB connection
│   ├── queues/      # BullMQ queue setup
│   ├── Redis/       # Shared Redis connection
│   ├── routes/      # routes definition
│   ├── services/    # DexRouter
│   ├── types/       # interfaces and Enums
│   ├── workers/     # background job processors
│   └── index.ts     # entry point
├── public/          # static frontend files
├── docker-compose.yml
└── Dockerfile
```

## Setup & Running

### Prerequisites
-   Docker & Docker Compose
-   Solana Devnet Wallet (Private Key)

### 1. Environment Setup
Copy the example environment file and add your Solana Private Key.
```bash
cp .env.example .env
# Open .env and paste your PRIVATE_KEY array
```

### 2. Run with Docker
The entire stack is managed via Docker Compose.

```bash
docker-compose up -d --build
```

## API Endpoints
- `POST /api/orders/execute`: Submit an order.
- `WS /api/orders/ws`: WebSocket connection for order updates.

### Postman Collection
A Postman collection is included in the repository to help you test the API.
-   **File**: `postman_collection.json`
-   **Import**: Open Postman -> Import -> Upload `postman_collection.json`.

### 3. Access the Application
-   **UI**: Open [http://localhost:3000](http://localhost:3000)
-   **API**: `POST http://localhost:3000/api/orders/execute`

## Usage

1.  Open the UI in your browser.
2.  Select **Token In** (e.g., SOL) and **Token Out** (e.g., USDC).
3.  Enter an **Amount**.
4.  Click **Execute Order**.
5.  Watch the **Live Updates** panel for real-time status changes.

## Troubleshooting

### Airdrop Failed / 429 Too Many Requests
If you see "Airdrop failed" in the logs, it means the Solana Devnet faucet is rate-limiting your IP.
-   **Behavior**: The system will automatically fall back to a **Mock Transaction** so your order flow completes successfully.
-   **Fix**: Wait a few hours or use a different IP/Wallet if you need real SOL.

## Design Decisions

### Order Type: Market Order
I chose to implement **Market Orders** for this MVP because:
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
