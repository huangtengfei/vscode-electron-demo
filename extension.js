// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const statusFilePath = path.join(__dirname, './status.json');

const execPromise = (cmd, options) => {
    return new Promise((resolve, reject) => {
        cp.exec(cmd, options, (error, stdout, stderr) => {
            if (error && stderr) {
                reject(stderr)
            }
            resolve(stdout)
        })
    })
}

let statusContent;

if (!fs.existsSync(statusFilePath)) {
    statusContent = {
        installed: false
    };
} else {
    statusContent = require(statusFilePath);
} 

if (!statusContent.installed) {
    const statusBar = vscode.window.setStatusBarMessage('$(watch)\tPlease wait a while for setting up the extension...');
    const output = vscode.window.createOutputChannel('seek');

    Promise.all([
        execPromise('npm run pretest', {
            cwd: path.join(__dirname, './node_modules/electron'),
            env: Object.assign(
                {},
                process.env,
                {
                    ELECTRON_MIRROR: "https://npm.taobao.org/mirrors/electron/"
                }
            )
        }),
        execPromise('npm rebuild node-sass --registry=http://registry.npm.alibaba-inc.com', {
            cwd: path.join(__dirname)
        })
    ]).then(() => {
        statusBar.dispose();
        statusContent.installed = true;
        fs.writeFileSync(statusFilePath, JSON.stringify(statusContent, null, 2), 'utf-8');
    }).catch(err => {
        output.show();
        output.appendLine(`exec error: ${err}`);
        return;
    })
}

let electronProcess = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-plugin-seek" is now active!');

    const os = require('os');
    const createServer = require('./lib/service-bridge/server');
    const driver = require('./lib/driver');
    const spawnElectron = require('./lib/spawnElectron');
    const tmpdir = os.tmpdir();
    const sockPath = `unix://${tmpdir}/seek.sock`;

    const currDir = vscode.workspace.rootPath;

    createServer(driver, {
        path: sockPath
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    const seekAdd = vscode.commands.registerCommand('extension.seekAdd', function () {
        const statusBar = vscode.window.setStatusBarMessage('$(watch)\t 正在启动添加场景界面...');
        setTimeout(function () {
            statusBar.dispose();
        }, 3000);
        electronProcess = spawnElectron({
            appPath: path.join(__dirname, 'app'),
            sockPath,
            envParams: {
                ELECTRON_CURR_VIEW: 'add',
                ELECTRON_CURR_DIR: currDir
            }
            // others options in the future
        });
    })

    context.subscriptions.push(seekAdd);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    if (electronProcess) {
        electronProcess.kill();
    }
}
exports.deactivate = deactivate;
