
const form = document.getElementById('orderForm');
const logsDiv = document.getElementById('logs');
let ws;

const TOKEN_LIST = [
  { symbol: "SOL", name: "Solana" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "BONK", name: "Bonk" },
  { symbol: "RAY", name: "Raydium" },
  { symbol: "JUP", name: "Jupiter" },
  { symbol: "MPL", name: "Maple" }
];

function loadTokenOptions() {
  const tokenInSel = document.getElementById("tokenIn");
  const tokenOutSel = document.getElementById("tokenOut");
  tokenInSel.innerHTML = '';
  tokenOutSel.innerHTML = '';
  
  TOKEN_LIST.forEach(t => {
    const optionIn = document.createElement("option");
    optionIn.value = t.symbol;
    optionIn.textContent = `${t.symbol} - ${t.name}`;
    const optionOut = document.createElement("option");
    optionOut.value = t.symbol;
    optionOut.textContent = `${t.symbol} - ${t.name}`;
    tokenInSel.appendChild(optionIn);
    tokenOutSel.appendChild(optionOut);
  });
  tokenInSel.value = "SOL";
  tokenOutSel.value = "USDC";
}

loadTokenOptions();

function swapTokens() {
  const tokenIn = document.getElementById('tokenIn');
  const tokenOut = document.getElementById('tokenOut');
  const temp = tokenIn.value;
  tokenIn.value = tokenOut.value;
  tokenOut.value = temp;
}

function connectWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  ws = new WebSocket(`ws://${window.location.host}/api/orders/ws`);
  
  ws.onopen = () => addLog('Connected to WebSocket', 'success');
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const status = data.status?.toLowerCase() || '';
      let logType = 'info';
      if (status.includes('confirmed')) logType = 'success';
      else if (status.includes('routing') || status.includes('building') || status.includes('pending') || status.includes('submitted')) logType = 'pending';
      else if (status.includes('error') || status.includes('failed')) logType = 'error';
      addLog(`Order ${data.orderId}: ${data.status}`, logType);
    } catch (e) {
      addLog(event.data, 'info');
    }
  };
  
  ws.onerror = (error) => addLog(`WebSocket Error: ${error}`, 'error');
  ws.onclose = () => addLog('WebSocket disconnected', 'pending');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tokenIn = document.getElementById('tokenIn').value;
  const tokenOut = document.getElementById('tokenOut').value;
  const amount = parseFloat(document.getElementById('amount').value);
  
  addLog(`Processing ${amount} ${tokenIn} → ${tokenOut}...`, 'pending');
  
  try {
    const response = await fetch('/api/orders/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenIn, tokenOut, amount })
    });
    const result = await response.json();
    addLog(`Order Posted: ${result.orderId}`, 'success');
    connectWebSocket();
  } catch (err) {
    addLog(`Error: ${err.message}`, 'error');
  }
});

function addLog(message, type = 'info') {
  const log = document.createElement('div');
  log.className = 'log-entry';
  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  const msg = document.createElement('span');
  msg.className = `log-${type}`;
  msg.textContent = message;
  log.appendChild(time);
  log.appendChild(msg);
  logsDiv.prepend(log);
}

addLog('System initialized', 'info');