let currGuiProcess = null;

module.exports = function(options) {
  delete process.env.ELECTRON_RUN_AS_NODE;

  const {
      appPath,
      sockPath,
      envParams
  } = options;

  // TODO: optimize the code here
  const spawn = require('child_process').spawn;
  const electron = require('electron');
  currGuiProcess && currGuiProcess.kill();
  let electronProcess = null;
  try {
      electronProcess = spawn(electron, [ appPath ], {
          stdio: [0, 1, 2],
          env: Object.assign(
              {},
              process.env,
              {
                  SERVICE_BRIDGE_PATH: sockPath
              },
              envParams
          )
      });
  } catch(e) {
      console.log(e)
  }

  process.env.ELECTRON_RUN_AS_NODE = "1";
  currGuiProcess = electronProcess;
  
  return electronProcess;
}
