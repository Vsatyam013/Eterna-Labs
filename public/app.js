console.log('App.js v2 loaded - WebSocket connects on submit');
const form = document.getElementById('orderForm');
const logsDiv = document.getElementById('logs');
let ws;

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    ws = new WebSocket(`ws://${window.location.host}/api/orders/ws`);

    ws.onopen = () => {
        addLog('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            addLog(`Order ${data.orderId}: ${data.status} ${JSON.stringify(data)}`);
        } catch (e) {
            addLog(event.data);
        }
    };
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tokenIn = document.getElementById('tokenIn').value;
    const tokenOut = document.getElementById('tokenOut').value;
    const amount = parseFloat(document.getElementById('amount').value);

    try {
        const response = await fetch('/api/orders/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenIn, tokenOut, amount })
        });

        const result = await response.json();
        addLog(`Order Submitted: ${result.orderId}`);
        connectWebSocket();
    } catch (err) {
        addLog(`Error: ${err.message}`);
    }
});

function addLog(message) {
    const log = document.createElement('div');
    log.className = 'log-entry';
    log.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logsDiv.prepend(log);
}
