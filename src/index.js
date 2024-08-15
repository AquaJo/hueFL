// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');
//Menu.setApplicationMenu(false)
const path = require('path');
let mainWindow;
let settingsWindow;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height: 630,
      transparent: true,
      frame: false,
      //show: false, // don't show the main window
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,

        preload: path.join(__dirname, 'preload.js'), // use a preload script
        autoHideMenuBar: true,
        allowEval: false,
      },
      resizable: false,
    });

    ipcHandling();

    // create a new `splash`-Window
    //splash = new BrowserWindow({ width: 200, height: 200, transparent: false, frame: false, alwaysOnTop: false }); // in case of further use --> alwaysOnTop:true
    //splash.loadUrl(`file://${__dirname}/splash.html`);
    //splash.loadFile("./src/splash.html");
    //mainWindow.hide();
    mainWindow.loadFile(`./src/index.html`);
    // if main window is ready to show, then destroy the splash window and show up the main window
    mainWindow.webContents.on('did-finish-load', () => {
      // and load the index.html of the app.
      //mainWindow.setMenuBarVisibility(false);
      //splash.destroy();

      //mainWindow.show();
      mainWindow.minimize();
      mainWindow.restore();
      mainWindow.on('minimize', () => {
        //console.log("mini");
        mainWindow.webContents.send('minimize', ''); // take action in render (particle.js mainly  yet)
      });
      mainWindow.on('restore', () => {
        //console.log("restore");
        mainWindow.webContents.send('restore', ''); // take action in render
      });
      /*mainWindow.setAlwaysOnTop("true");
      setTimeout(function () {
        mainWindow.setAlwaysOnTop("false");
      },1000)*/
      // once show then it leaves from top when click outside

      // temporary update checking insert
      if (app.isPackaged) {
        mainWindow.webContents.send(
          'log',
          'Giving you update information in the following.'
        );
        autoUpdater.checkForUpdatesAndNotify();

        autoUpdater.on('update-available', () => {
          console.log('Update verfügbar!');
          mainWindow.webContents.send('log', 'Update verfügbar!');
        });

        autoUpdater.on('update-downloaded', async () => {
          console.log('Update heruntergeladen!');
          mainWindow.webContents.send('log', 'Update heruntergeladen!'); // ()
          // delete java process if existent before quitAndInstall!! --> using jarExec.pid
          try {
            process.kill(jarExec.pid);
            console.log(`Java process with PID ${jarExec.pid} terminated.`);
          } catch (error) {
            console.info(
              `Failed to terminate Java process with PID ${jarExec.pid}: ${error.message}. Maybe you were running an instance without java installed?`
            );
          }
          let obj = {};
          obj.deleteJavaProcess = '1';
          setCommunicatorJSON([obj, '']);

          autoUpdater.quitAndInstall();
        });

        autoUpdater.on('error', (err) => {
          console.error('Fehler beim Überprüfen des Updates:', err);
          mainWindow.webContents.send(
            'log',
            `Fehler beim Überprüfen des Updates: ${err}`
          );
        });
      } else {
        console.log('Running in development mode. Skipping update check.');
        mainWindow.webContents.send(
          'log',
          'Running in development mode. Skipping update check.'
        );
      }
    });

    //mainwWindow.removeMenu()
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
  };
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  const child_process = require('child_process');
  let jarExec;
  app.on('window-all-closed', async () => {
    console.log('close detected');
    // communicate with java to delete ongoing java program
    let obj = {};
    obj.deleteJavaProcess = '1';
    setCommunicatorJSON([obj, '']);

    if (process.platform !== 'darwin') app.quit();
  });
  const fs = require('fs');
  function setCommunicatorJSON(data) {
    let stringData = JSON.stringify(data[0]);
    if (stringData.length < 200000) {
      fs.writeFileSync(
        path.join(__dirname, '/jars/communicator.json'),
        stringData
      );
      return true;
    } else {
      return false;
    }
  }
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  //IPC HANDLING (COMMUNICATING WITH RENDER HERE

  //const fetch = require('node-fetch');
  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
  function ipcHandling() {
    // IP STUFF
    ipcMain.handle('ip', async (event, data) => {
      const os = require('os');

      var interfaces = os.networkInterfaces();
      var addresses = [];
      for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
          }
        }
      }

      return addresses[0];
    });

    // FETCHING STUFF
    ipcMain.handle('fetch-put', async (event, dataArray) => {
      /* DATA ARRAY:
      0: url
      1: data (JSON)
      2: timeout
      */
      let url = dataArray[0];
      let data = dataArray[1];
      let timeout = dataArray[2];
      // Default options are marked with *
      let controller = new AbortController();
      setTimeout(function () {
        controller.abort();
        return 'timeout';
      }, timeout);
      let response;
      try {
        response = await fetch(url, {
          method: 'PUT', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
      } catch (err) {
        return 'error';
      }
      return response.json(); // parses JSON response into native JavaScript objects
    });

    ipcMain.handle('fetch-post', async (event, dataArray) => {
      /* DATA ARRAY:
      0: url
      1: data (JSON)
      2: timeout
      */
      let url = dataArray[0];
      let data = dataArray[1];
      let timeout = dataArray[2];
      // Default options are marked with *
      let controller = new AbortController();
      setTimeout(function () {
        controller.abort();
        return 'timeout';
      }, timeout);
      let response;
      try {
        response = await fetch(url, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
      } catch (err) {
        return 'error';
      }
      return response.json(); // parses JSON response into native JavaScript objects
    });

    ipcMain.handle('fetch-get', async (event, dataArray) => {
      /* DATA ARRAY:
      0: url
      1: timeout
      */
      let url = dataArray[0];
      let timeout = parseInt(dataArray[1]);
      // Default options are marked with *
      let controller = new AbortController();
      setTimeout(function () {
        controller.abort();
        return 'timeout';
      }, timeout);
      let response;
      try {
        response = await fetch(url, {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
      } catch (err) {
        return 'error';
      }
      return response.json(); // parses JSON response into native JavaScript objects
    });

    // BTNS (MINIMIZE & CLOSE)

    ipcMain.handle('minimize', async (event, data) => {
      mainWindow.minimize();
      return;
    });
    ipcMain.handle('close', async (event, data) => {
      //console.log((new URL(event.senderFrame.url)));
      //if (!validateSender(event.senderFrame)) return null;
      mainWindow.close();
      return;
    });
    ipcMain.handle('closeSettings', async (event, data) => {
      settingsWindow.hide(); // first hide before closing because of weird position change on deletion --> maybe keep it open and show / hide it in future ....
      settingsWindow.close();
      return;
    });
    ipcMain.handle('getCommunicatorJSON', async (event, data) => {
      let rawdata = fs.readFileSync(
        path.join(__dirname, '/jars/communicator.json')
      );
      let json = JSON.parse(rawdata);
      return json;
    });
    ipcMain.handle('setCommunicatorJSON', async (event, data) => {
      setCommunicatorJSON(data);
    });
    let javaCounter = 0;
    ipcMain.handle('startJavaProgram', () => {
      javaCounter++;
      if (javaCounter == 1) {
        // so only one time possibility to call this from frontend
        var spawn = require('child_process').spawn('java', ['-version']);
        spawn.on('error', function (err) {
          // error --> alert no java is installed
          console.log('spawn error, java');
          console.log(err);
          mainWindow.webContents.send('noJavaAlert', '');
        });
        let count2 = 0; // because sometimes second runthrough and then failure message
        spawn.stderr.on('data', function (data) {
          count2++;
          if (count2 == 1) {
            data = data.toString().split('\n')[0];
            var javaVersion = new RegExp('java version').test(data)
              ? data.split(' ')[2].replace(/"/g, '')
              : false;
            if (javaVersion != false) {
              // TODO: We have Java installed
              console.log('java is installed');
              console.log('Current directory:', __dirname);
              // working start
              let execJava = true;
              if (execJava) {
                var exec = require('child_process').exec; // !
                jarExec = exec(
                  __dirname.split('\\')[0] +
                    ' && cd ' +
                    __dirname +
                    ' && java -jar ' +
                    './jars/Hue-Ambiance.jar',
                  (err, stdout, stderr) => {
                    if (err) {
                      mainWindow.webContents.send('noJavaAlert', '');
                      throw err;
                    }
                    console.log(stdout);
                    console.log(stderr);
                  }
                );
                //console.log(jarExec);
                console.log('jarExec.pid:' + jarExec.pid);
              }
            } else {
              // TODO: No Java installed
              console.log("java isn't installed --> showing alert");
              mainWindow.webContents.send('noJavaAlert', '');
            }
          } else {
            console.log('count2 >= 2');
          }
        });
      }
    });
    // Settings-page stuff
    ipcMain.handle('openSettings', () => {
      let mainPos = mainWindow.getPosition();
      settingsWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 615,
        height: 600,
        show: true,
        transparent: true,
        frame: false,
        webPreferences: {
          nodeIntegration: false,
          webSecurity: true,
          allowEval: false,
          allowRunningInsecureContent: false,
          contextIsolation: true,
          enableRemoteModule: true,
          preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
        resizable: false,
        x: mainPos[0] + 100,
        y: mainPos[1] + 17,
      });
      /*
      win.loadURL(url.format({
        pathname: path.join(__dirname, 'src/settings/index.html'),
        protocol: 'file:',
        slashes: true,
      }));*/
      settingsWindow.loadFile(`./src/settings/index.html`);
    });

    //
    function validateSender(frame) {
      // Value the host of the URL using an actual URL parser and an allowlist
      if (new URL(frame.url).host === 'electronjs.org') return true;
      return false;
    }
  }
}
