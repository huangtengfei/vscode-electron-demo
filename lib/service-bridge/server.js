const axon = require('axon');
const { resPack, HANDSHAKE_TYPE } = require('./protocol');

function createServer(driver, options) {
  const sock = axon.socket('rep');
  const path = options.path;
  const host = options.host || '0.0.0.0';
  const port = options.port || 0;
  if (path) {
    sock.bind(path);
  } else {
    sock.bind(port, host);
  }

  sock.on('message', (reqPack, reply) => {
    if (reqPack.type === HANDSHAKE_TYPE) {
      const pack = resPack(Object.keys(driver));
      reply(pack);
    } else {
      const methodName = reqPack.type;
      const args = reqPack.payload;
      Promise.resolve(driver[methodName].apply(driver, args)).then((result) => {
        const pack = resPack(result);
        reply(pack);
      }).catch((e) => {
        reply(e);
      });
    }
  });

  return sock;
}

module.exports = createServer;
