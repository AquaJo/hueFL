let bridgeIP = localStorage.getItem('bridgeIP');
let apiKey = localStorage.getItem('apiKey');
let mainMode = localStorage.getItem('mainMode');
//resetKeysTemp();
function resetKeysTemp() {
  apiKey = null;
  bridgeIP = null;
}

//console.log("http://" + bridgeIP + "/api/" + apiKey + "/lights"); // log api - path
//deleteWholeLocalStorage();
function deleteWholeLocalStorage() {
  localStorage.clear();
}
if (apiKey === null && !settings.devModeNoPort) {
  // first check ... Already successfully registrated API key??
  welcomePage.style.display = 'block';
  mainTitle.style.display = 'block';
} else {
  // registered API key --> check if configs still work
  console.log('key: ' + apiKey);
  console.log('ip: ' + bridgeIP);
  getData('http://' + bridgeIP + '/api/' + apiKey + '/lights', 4000).then(
    (data) => {
      console.log(data);
      if (data === 'error' || Array.isArray(data)) {
        // error occured with received data ... --> welcome page
        welcomePage.style.display = 'block';
        mainTitle.style.display = 'block';
      } else {
        mainPageInizialize();
      }
    }
  );
}
function xyBriToRgb(x, y, bri) {
  z = 1.0 - x - y;

  Y = bri / 255.0; // Brightness of lamp
  X = (Y / y) * x;
  Z = (Y / y) * z;
  r = X * 1.612 - Y * 0.203 - Z * 0.302;
  g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r =
    r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, 1.0 / 2.4) - 0.055;
  g =
    g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, 1.0 / 2.4) - 0.055;
  b =
    b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, 1.0 / 2.4) - 0.055;
  maxValue = Math.max(r, g, b);
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  r = r * 255;
  if (r < 0) {
    r = 255;
  }
  g = g * 255;
  if (g < 0) {
    g = 255;
  }
  b = b * 255;
  if (b < 0) {
    b = 255;
  }

  r = Math.round(r).toString(16);
  g = Math.round(g).toString(16);
  b = Math.round(b).toString(16);

  if (r.length < 2) r = '0' + r;
  if (g.length < 2) g = '0' + g;
  if (b.length < 2) b = '0' + r;
  rgb = '#' + r + g + b;

  return rgb;
}
//console.log(xyBriToRgb(0.3769,0.3805, 254));

// RESET && CLOSE BTN
// ON MINIMIZE HOVER --> support element
$('#minimize').hover(
  function () {
    document.getElementById('minimizeSupportDiv').style.opacity = '1';
  },
  function () {
    document.getElementById('minimizeSupportDiv').style.opacity = '0';
  }
);
$('#minimizeSupportDiv').hover(
  function () {
    document.getElementById('minimizeSupportDiv').style.opacity = '1';
    document.getElementById('minimize').style.background =
      'rgba(99, 96, 96, 0.8)';
  },
  function () {
    document.getElementById('minimizeSupportDiv').style.opacity = '0';
    document.getElementById('minimize').style.background = '';
  }
);

document
  .getElementById('minimize')
  .addEventListener('click', async function () {
    await api.send('minimize', '');
  });
document.getElementById('close').addEventListener('click', async function () {
  if (settings.devModeNoPort) {
    localStorage.setItem('rooms', devModeNoPortBackupRooms);
    localStorage.setItem('lastRoom', devModeNoPortBackupLastRoom);
  }
  await api.send('close', '');
});

// ALL MINIMIZE AND RESTORE EVENTS SENT FROM MAIN
api.handle(
  'minimize',
  (event, data) =>
    function (event, data) {
      pJSDom[0].pJS.particles.move.enable = false;
      console.log('paused particle js');
    },
  event
);
api.handle(
  'restore',
  (event, data) =>
    function (event, data) {
      pJSDom[0].pJS.particles.move.enable = true;
      pJSDom[0].pJS.fn.particlesRefresh();
      console.log('restored particle js');
    },
  event
);

// sync communicator.json with settings if changed --> is not null (read from localStorage) else set defaults
setCommunicatorJSONAmbianceSettings();
async function setCommunicatorJSONAmbianceSettings() {
  if (localStorage.getItem('settings') !== null) {
    let settings = JSON.parse(localStorage.getItem('settings'));
    sendSettingsToCommunicator(settings);
  } else {
    setToDefaultsSettings(); // ...
    function setToDefaultsSettings() {
      let settings = {};
      settings.Ambiances = {};
      settings.Ambiances.maxDimmableBackgroundSync = 254; // didn't want to create another level of depth for background sync etc.
      settings.Ambiances.minDimmableBackgroundSync = 0;
      settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync = false;
      settings.Ambiances.luminanceTresholdForTurnOffBackgroundSync = 30;
      settings.Ambiances.dimmableMultiplierBackgroundSync = 1;
      settings.Ambiances.minLuminanceChangeRate = 20;
      settings.Ambiances.minRGBChangeRate = 1;

      localStorage.setItem('settings', JSON.stringify(settings));
      localStorage.setItem('settingsDefaults', JSON.stringify(settings));
      sendSettingsToCommunicator(settings);
    }
  }
  async function sendSettingsToCommunicator(settings) {
    // same code as in script.js from settings-page folder
    // set communicator json
    let communicatorObj = await getCommunicatorJSON();
    communicatorObj.generalSettings = {}; // reset to empty Object in case of not declared
    let communicatorObjSection = communicatorObj.generalSettings;
    communicatorObjSection = settings.Ambiances; // already parsed
    communicatorObj.generalSettings = communicatorObjSection; //...
    setCommunicatorJSON(communicatorObj); // set final obj
  }
}

// api handling no java alerting
let noJavaIcon = document.getElementById('noJavaIcon');
noJavaIcon.style.left = '-100px';
api.handle(
  'noJavaAlert',
  (event, data) =>
    function (event, data) {
      noJavaIcon.style.left = '10px';
      if (localStorage.getItem('javaRemember') !== 'false') {
        // false even if send as boolean gets saved as string due to local storage properties ...
        vex.dialog.confirm({
          message:
            "Java isn't installed. Please be aware that Java is required to run essential functions like background syncing.",
          buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'remember me' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'dismiss forever' }),
          ],
          callback: function (value) {
            if (value) {
              console.log('set to remember');
            } else {
              localStorage.setItem('javaRemember', false);
              console.log('set java alert to dismiss');
            }
          },
        });
      }
    },
  event
);

//localStorage.removeItem("settings");
//localStorage.removeItem("settingsDefaults");

electron.onLog((event, message) => {
  console.log(message);
});
