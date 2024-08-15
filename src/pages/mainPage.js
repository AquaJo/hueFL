//localStorage.removeItem("rooms");
//localStorage.clear();
//loginInfoClear();
function loginInfoClear() {
  localStorage.removeItem('bridgeIP');
  localStorage.removeItem('apiKey');
}
console.log(localStorage.getItem('rooms'));
/* IF ROOM RESET WANTED*/ /*
localStorage.removeItem("lastRoom");
localStorage.removeItem("rooms");
*/

let devicesHome = [];
async function mainPageInizialize() {
  // initialize ...
  if (mainMode === null) {
    localStorage.setItem('mainMode', 'menue');
    mainMode = localStorage.getItem('mainMode'); // ()
  }
  mainPage.style.display = 'block';
  document.getElementById('mainTitle').style.display = 'block';

  if (mainMode === 'menue') {
    // ()
    await setCommunicatorKeyInfo();
    api.send('startJavaProgram'); // only one time per app possible // start Java-Ambiance-Controller --> requires obviously java installed ... // after setCommunicatorKeyInfo --> else automatic close of program, --> closes when no information set
    homeMPage.style.display = 'block';
    await refresh();
    lastRoomString = localStorage.getItem('lastRoom');
    let lastRoom = parseInt(localStorage.getItem('lastRoom'));
    if (lastRoom != NaN && lastRoom != 0 && lastRoomString !== null) {
      let lastRoomIndex = lastRoom - 1; // where 0 (local storage) is menue and 1) is adressing own created rooms
      roomsLeftBar[lastRoomIndex].click();
    }
  }
}
async function setCommunicatorKeyInfo() {
  let obj = await getCommunicatorJSON();
  try {
    delete obj.deleteJavaProcess;
  } catch (e) {}
  try {
    if (obj.keyInformation.apiKey !== apiKey) {
      obj.keyInformation.apiKey = apiKey;
    }
  } catch (e) {
    obj.keyInformation = {};
    obj.keyInformation.apiKey = apiKey;
  }
  try {
    if (obj.keyInformation.IP !== bridgeIP) {
      obj.keyInformation.IP = bridgeIP;
    }
  } catch (e) {
    obj.keyInformation.IP = bridgeIP;
  }
  try {
    if (settings.resetAmbiances) {
      obj.activeSyncs.rgbLights = {};
    }
  } catch (e) {
    obj.activeSyncs = {};
    obj.activeSyncs.rgbLights = {};
  }
  try {
    if (settings.resetAmbiances) {
      obj.activeSyncs.dimmableLights = {};
    }
  } catch (e) {
    obj.activeSyncs = {};
    obj.activeSyncs.dimmableLights = {};
  }
  await setCommunicatorJSON(obj);
}
document.getElementById('refresh').addEventListener('click', function () {
  menueMain.click();

  //
  hideAllSingeDropdowns(); // added here bec of first refresh would in turn make them visible ^^
  //
  refresh();
});

let lightsHomeOrder = [];
let refreshProgess = false;
async function refresh() {
  if (!refreshProgess) {
    refreshProgess = true;
    try {
      for (lamp of devicesHome) {
        lamp.delete();
      }
      devicesHome = [];
      await getData(
        'http://' + bridgeIP + '/api/' + apiKey + '/lights',
        settings.fetchTime
      ) // 200 --> maybe higher
        .then(async (data) => {
          //get keys
          let resKeys = [];
          for (let keys in data) {
            devicesHome.push(new Devices(keys));
            console.log('pushed: ' + keys);
          }
          let zIndex = devicesHome.length + 4;
          lightsHomeOrder = [];
          for (lamps of devicesHome) {
            await lamps.create(zIndex); // await is important in this case
            lamps.on_Listener();
            lamps.dim_Listener();
            lamps.main_Listener();
            lamps.initializeDropper();
            lamps.dropdownListener();
            lamps.showAdd();
            lamps.addToRoom_Listener();
            lamps.hideDeleteInDropdown();
            lamps.deleteDropdownListener();

            lamps.moveBarListener();
            zIndex--;

            lightsHomeOrder.push(lamps.returnUniqueID());
          }

          //devicesHome[0].displayNone();
          lastRoomOrder = lightsHomeOrder;
        });
      // remove all objects inside rgbLights object in communicator.json
      let obj = await getCommunicatorJSON();
      let myObject = obj.activeSyncs.rgbLights;
      for (let member in myObject) delete myObject[member];
      await setCommunicatorJSON(obj);
      //
      refreshRooms();
      setTimeout(function () {
        refreshProgess = false;
      }, 300);
    } catch (err) {}
  }
}

//
jQuery(document).ready(function ($) {
  setTimeout(function () {
    $('.listdrop').toggleClass('hidden');
  }, 1000);
});
//

function hideRoomsMenue() {
  // ^^
  document.getElementById('dropdownChrome').style.display = 'none';
  document.getElementById('allOn').style.display = 'none';
  document.getElementById('allOff').style.display = 'none';
  document.getElementById('addLight').style.display = 'none';
}
function showRoomsMenue() {
  // ^^
  document.getElementById('dropdownChrome').style.display = 'block';
  document.getElementById('allOn').style.display = 'block';
  document.getElementById('allOff').style.display = 'block';
  document.getElementById('addLight').style.display = 'block';
}

// menue - bar toggling
let settingsMain = document.getElementById('mainSettings');
let menueMain = document.getElementById('mainHome');
let addMain = document.getElementById('mainAdd');
let addMainLight = document.getElementById('light_add');
settingsMain.addEventListener('click', function () {
  if (
    window.getComputedStyle(document.getElementById('create-collapse'))
      .display === 'block'
      ? true
      : false
  ) {
    addMain.click();
  }
  menue_resetAll();
  settingsMain.className = 'nav-link active';
});
menueMain.addEventListener('click', function () {
  // hide custom options of rooms
  hideRoomsMenue();
  currentRoomIndex = undefined;
  localStorage.setItem('lastRoom', '0');

  if (
    window.getComputedStyle(document.getElementById('settings-collapse'))
      .display === 'block'
      ? true
      : false
  ) {
    settingsMain.click();
  } else {
    if (
      window.getComputedStyle(document.getElementById('create-collapse'))
        .display === 'block'
        ? true
        : false
    ) {
      addMain.click();
    }
  }

  menue_resetAll();
  menueMain.className = 'nav-link active';
  for (let lamp of devicesHome) {
    lamp.showAdd();
    lamp.hideDeleteInDropdown();
    lamp.hideDropdown();
  }
  showLightsInOrder(lightsHomeOrder);
});

addMain.addEventListener('click', function () {
  if (
    window.getComputedStyle(document.getElementById('settings-collapse'))
      .display === 'block'
      ? true
      : false
  ) {
    settingsMain.click();
  }
  menue_resetAll();
  addMain.className = 'nav-link active';
});

addMainLight.addEventListener('click', function (e) {
  e.preventDefault();
  vex.dialog.open({
    message: 'Sorry, this feature is not implemented yet!',
    buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
  });
});
function menue_resetAll() {
  // also resets lower room-buttons
  settingsMain.className = 'nav-link text-white';
  menueMain.className = 'nav-link text-white';
  addMain.className = 'nav-link text-white';
  for (let room of roomsLeftBar) {
    room.deactivate();
  }
}

let createRoomList = [];
document
  .getElementById('room_add')
  .addEventListener('click', async function () {
    try {
      for (lamp of createRoomList) {
        lamp.delete();
      }
      createRoomList = [];
      await getData(
        'http://' + bridgeIP + '/api/' + apiKey + '/lights',
        settings.fetchTime
      ) // 200 --> maybe higher
        .then(async (data) => {
          for (let keys in data) {
            createRoomList.push(new BootstrapList('list_addRoom', keys));
          }
          for (lamps of createRoomList) {
            await lamps.create(); // await is important in this case
            lamps.onClick_Listener();
          }
          //devicesHome[0].displayNone();
        });
    } catch (err) {
      console.log(err);
    }
    menueModal.addRoom();
  });

function refreshRooms(clickOnName) {
  try {
    console.log(roomsLeftBar);
    for (let room of roomsLeftBar) {
      room.delete();
    }
  } catch (err) {
    console.log(err);
  }
  let rooms = localStorage.getItem('rooms');
  roomsLeftBar = [];
  if (rooms != null) {
    rooms = JSON.parse(rooms);
    console.log(rooms);
    for (let i = 0; i < rooms.length; ++i) {
      // create for each rooms entry a list item for the leftbar in rooms section
      roomsLeftBar.push(new Rooms(i));
      roomsLeftBar[i].create();
      roomsLeftBar[i].onClick_Listener();
      roomsLeftBar[i].dragListener();
      if (rooms[i].name === clickOnName) {
        roomsLeftBar[i].click();
      }
    }
  }
}

// rooms options
let dropDownRooms = document.getElementById('dropdownChrome');
setTimeout(function () {
  let list = dropDownRooms.children[0];
  dropDownRooms.addEventListener('click', function () {
    list.classList.toggle('hidden'); //(!)

    if (settings.hideDropdownsOnNewOpen) {
      for (let light of devicesHome) {
        light.hideDropdown();
      }
    }
  });
}, 1000);
dropDownRooms.click(function () {});

function hideAllSingeDropdowns() {
  let list = document.getElementById('roomsMenueListDrop');
  let cL = list.classList;
  if (!cL.contains('hidden')) {
    list.classList.add('hidden');
  }
}

let currentRoomIndex;

document.getElementById('deleteLIRooms').addEventListener('click', function () {
  menueModal.deleteWarning();
});
document.getElementById('renameLIRooms').addEventListener('click', function () {
  menueModal.rename();
});

document.getElementById('allOn').addEventListener('click', allON);
document.getElementById('turnOnLIRooms').addEventListener('click', allON);
document.getElementById('allOff').addEventListener('click', allOFF);
document.getElementById('turnOffLIRooms').addEventListener('click', allOFF);
document.getElementById('addLight').addEventListener('click', addLight);
document.getElementById('addLightLIRooms').addEventListener('click', addLight);
function addLight() {
  menueModal.addRoomLight();
}

function allON() {
  let roomsDevices = uniqueIdsToDevices(roomIndexToUniqueIds(currentRoomIndex));
  for (lamps of roomsDevices) {
    lamps.onClick();
  }
}
function allOFF() {
  let roomsDevices = uniqueIdsToDevices(roomIndexToUniqueIds(currentRoomIndex));
  for (lamps of roomsDevices) {
    lamps.offClick();
  }
}

function roomIndexToUniqueIds(index) {
  let rooms = localStorage.getItem('rooms');
  rooms = JSON.parse(rooms);
  return rooms[index].uniqueIds;
}
function uniqueIdsToDevices(ids) {
  let accordingLamps = [];
  for (let lamp of devicesHome) {
    let id = lamp.returnUniqueID();
    if (ids.includes(id)) {
      accordingLamps.push(lamp);
    } else {
    }
  }
  return accordingLamps;
}

document
  .getElementById('setAmbianceRooms')
  .addEventListener('click', function () {
    setAmbiance('room');
  });
function setAmbiance(mode) {
  menueModal.setAmbiance(mode);
}

function getRooms() {
  return JSON.parse(localStorage.getItem('rooms'));
}
function setRooms(rooms) {
  localStorage.setItem('rooms', JSON.stringify(rooms));
}

function showLightsInOrder(uniqueIds) {
  // lightsHomeOrder must be initialized
  let leftLightsIndices = [];
  for (let i = 0; i < lightsHomeOrder.length; ++i) {
    leftLightsIndices.push(i);
  }
  for (let i = uniqueIds.length - 1; i >= 0; --i) {
    let devicesIndex = lightsHomeOrder.indexOf(uniqueIds[i]);
    leftLightsIndices.splice(leftLightsIndices.indexOf(devicesIndex), 1);
    devicesHome[devicesIndex].displayBlock(true);
    devicesHome[devicesIndex].setZIndex(uniqueIds.length - 1 - i + 4);
  }
  for (let i = 0; i < leftLightsIndices.length; ++i) {
    devicesHome[leftLightsIndices[i]].displayNone();
  }
}

function IDToJSONID(uniqueID) {
  // remove ':' elements and replace them with special char-combos to make them accessible in java and to identify these breaks to make connections over bridge to lights
  let keyInsted = '<COLON>';
  final = uniqueID.replaceAll(':', keyInsted);
  return final;
}

// Settings dropdown options
let settingsGeneral = document.getElementById('settings_General');
let settingsBridge = document.getElementById('settings_Bridge');
let settingsUpdates = document.getElementById('settings_Updates');

settingsGeneral.addEventListener('click', function () {
  openSettings('general');
});
settingsBridge.addEventListener('click', function () {
  openSettings('bridge');
});
settingsUpdates.addEventListener('click', function () {
  openSettings('updates');
});
function openSettings(mode) {
  localStorage.setItem('currentSettingsOption', mode);
  api.send('openSettings', [mode]);
}
