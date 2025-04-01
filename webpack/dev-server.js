const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8082 });

console.log('Development WebSocket server started on port 8082');

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to trigger reload for all connected clients
function triggerReload() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'reload' }));
    }
  });
}

module.exports = { triggerReload };
