const WebSocket = require('ws');
const { logger } = require('../../src/core/utils/logger');

class ExtensionReloadPlugin {
  constructor(options = {}) {
    this.port = options.port || 8082;
    this.wsServer = null;
  }

  apply(compiler) {
    if (!this.wsServer) {
      this.wsServer = new WebSocket.Server({ port: this.port });
      logger.info(`[HMR] WebSocket server listening on port ${this.port}`);
    }

    compiler.hooks.done.tap('ExtensionReloadPlugin', stats => {
      if (stats.hasErrors()) {
        return;
      }

      // Notify all connected clients to reload
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'reload' }));
        }
      });
    });

    compiler.hooks.watchClose.tap('ExtensionReloadPlugin', () => {
      if (this.wsServer) {
        this.wsServer.close();
      }
    });
  }
}

module.exports = ExtensionReloadPlugin;
