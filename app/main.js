'use strict';

const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

const currDir = process.env.ELECTRON_CURR_DIR;

global.sharedObj = { dir: currDir };

app.on('ready', () => {
  // app.dock.hide();
  app.dock.setIcon(path.join(__dirname, '../images/seek.png'));

  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    title: "Seek",
    transparent: true,
    // frame: false,
    // webPreferences: {
    //   devTools: false
    // }
  });

  let devurl = `http://g.alicdn.com/seek-app/vscode-seek-process/1.0.4/index.html#/add`;
  mainWindow.loadURL(devurl);
  
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    const urlObj = url.parse(details.url);
    if (urlObj.protocol === 'file:' && urlObj.host) {
      urlObj.protocol = 'https:'
      callback({ cancel: false, redirectURL: url.format(urlObj)});
    } else {
      callback({ cancel: false });
    }
  });

  mainWindow.webContents.toggleDevTools();
});