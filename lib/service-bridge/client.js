const axon = require('axon');
const { reqPack, handshakePack } = require('./protocol');

function bindSendMessage(client, methodName) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const pack = reqPack(methodName, args);
      client.send(pack, (res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.errorMessage));
        }
      });
    });
  }
}

module.exports = function createClientDriver(options) {
  return new Promise((resolve, reject) => {
    const client = axon.socket('req');
    const path = options.path;
    const host = options.host || '0.0.0.0';
    const port = options.port || 0;

    if (path) {
      client.connect(path);
    } else {
      client.connect(port, host);
    }

    client.on('connect', () => {
      const pack = handshakePack();
      client.send(pack, (res) => {
        const methods = res.data;
        const driver = methods.reduce((ret, methodName) => {
          ret[methodName] = bindSendMessage(client, methodName);
          return ret;
        }, {});
        resolve(driver);
      });
    });
    client.on('error', reject);
  });
}
