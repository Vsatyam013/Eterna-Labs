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

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` and add your Solana Private Key.
    ```bash
    cp .env.example .env
    ```

3.  **Start Infrastructure**:
    Start PostgreSQL and Redis using Docker Compose.
    ```bash
    docker-compose up -d
    ```

4.  **Run the Server**:
    ```bash
    npm run dev
    ```

5.  **Start the Worker**:
    In a separate terminal, run the worker to process orders.
    ```bash
    npx ts-node src/workers/orderWorker.ts
    ```

## Usage
- Open `http://localhost:3000` in your browser.
- Enter Token In (e.g., SOL), Token Out (e.g., USDC), and Amount.
- Click "Execute Order".
- Watch the "Live Updates" section for real-time status changes.

## API Endpoints
- `POST /api/orders/execute`: Submit an order.
- `WS /api/orders/ws`: WebSocket connection for order updates.
