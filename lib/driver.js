const vscode = require('vscode');
const output = vscode.window.createOutputChannel('seek');

module.exports = {
  seekAdd() {
    output.show();
    output.appendLine('\nstart add...');
  }
};
