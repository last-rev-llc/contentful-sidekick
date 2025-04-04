const WebSocket = require('ws');
const { logger } = require('../src/core/utils/logger');

const wss = new WebSocket.Server({ port: 8082 });

logger.info('Development WebSocket server started on port 8082');

wss.on('connection', ws => {
  logger.debug('Client connected');

  ws.on('close', () => {
    logger.debug('Client disconnected');
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
