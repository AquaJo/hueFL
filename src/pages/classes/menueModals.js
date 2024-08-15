let roomNameLength = 17;

class MenueModals {
  constructor() {
    this.title = document.getElementById('menueModalTitle');
    this.body = document.getElementById('menueModalText');
    this.close = document.getElementById('menueModalCloseFooter');
    this.close2 = document.getElementById('menueModalCloseFooter1');
  }

  closeListener() {
    let self = this;
    let modal = document.getElementById('menueModal');
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      //modal.removeEventListener("hidden.bs.modal", detectModalClose);
      //
      self.reset();
      //alert("closed and reset");
    }
  }
  reset() {
    this.body.style.textAlign = 'left';
    this.body.style.height = 'auto';
    this.body.style.whiteSpace = '';
    document.getElementById('menueModalCreateRoom').style.display = 'none';
    document.getElementById('menueModalInputCreateRoom').value = '';
    document.getElementById('errorLoadIds').style.display = 'none';
    document.getElementById('deleteWarning').style.display = 'none';
    document.getElementById('renameRoom').style.display = 'none';
    document.getElementById('renameRoomInput').value = '';
    document.getElementById('addLightRoom').style.display = 'none';
    document.getElementById('setAmbiance').style.display = 'none';
    this.close2.style.display = 'none';
  }
  addRoom() {
    this.body.style.whiteSpace = 'pre';
    this.body.style.height = '400px';
    document.getElementById('menueModalCreateRoom').style.display = 'block';

    this.title.innerHTML = 'create new room';
    this.close.innerHTML = 'create';
    let self = this;
    //this.body.innerHTML = "";
    //alert("test");
    $('#menueModal').modal('show');
    let modal = document.getElementById('menueModal');
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      self.close.removeEventListener('click', closeListener);
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
    }
    this.close.addEventListener('click', closeListener);
    function closeListener() {
      let rooms = localStorage.getItem('rooms'); // check if rooms array exists on local storage

      if (rooms === null) {
        rooms = [];
      } else {
        rooms = JSON.parse(localStorage.getItem('rooms'));
      }
      let myObj = {}; // create object for new room
      let inpVal = document.getElementById('menueModalInputCreateRoom').value;
      let nameExists = false;
      for (let i = 0; i < rooms.length; ++i) {
        // simple include check would does it too ^^
        if (rooms[i].name !== inpVal) {
          nameExists = false;
        } else {
          nameExists = true;
          break;
        }
      }
      if (!nameExists && inpVal !== '' && inpVal.length <= roomNameLength) {
        // if name exists and is not ""
        myObj.name = inpVal; // set name in obj
        let finalUniqueIds = [];
        //console.log(createRoomList);
        let resIDS = [];
        for (lamps of createRoomList) {
          // loop through createRoomList-objects and run result(), which returns null if not selected or uniqueID, which will be safed in object
          let res = lamps.result();
          if (res !== null) {
            resIDS.push(res);
          }
        }

        myObj.uniqueIds = resIDS; // push created ids to object uniqueIds sector
        console.log(rooms);
        rooms.push(myObj); // push created object to rooms array
        //console.log(rooms);
        let roomsString = JSON.stringify(rooms); //rooms needs to be stringified, local storage can only handle strings
        localStorage.setItem('rooms', roomsString); // push whole rooms-array to local storage
        refreshRooms(inpVal); // refresh rooms class, which will refresh representation of rooms in leftbar in UI based on localStorage ("rooms")
      }
    }
  }
  IDNotFound(ids, roomsIndex) {
    this.body.style.whiteSpace = 'pre';
    this.title.innerHTML = 'error';
    let res = '<p class ="modalTitle1">could not find following lights:</p> ';
    res += '<p>their unique IDS are:</p>';
    let div = document.getElementById('errorLoadIds');
    div.innerHTML = res + '<div id = "errorLoadIdsWrapper"></div>';
    div.style.display = 'block';
    div.style.marginTop = '-55px';
    div.style.maxHeight = '320px';
    res = '';
    for (let i = 0; i < ids.length; ++i) {
      res += ids[i] + '<br>';
    }
    let wrapper = document.getElementById('errorLoadIdsWrapper');
    wrapper.style.maxHeight = '270px';
    wrapper.style.overflowY = 'auto';
    wrapper.innerHTML = res;
    this.close.innerHTML = 'okay';
    this.close2.innerHTML = 'dismiss them';
    this.close2.style.display = 'block';

    // close listener
    let modal = document.getElementById('menueModal');
    let self = this;
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      // close(1) does nothing than closing modal, keeps items in list ... nothing to do
      self.close2.removeEventListener('click', close2Listener); // removes elements from list so the error modal wont show again, as long not a new unique ID vanished
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
    }
    this.close2.addEventListener('click', close2Listener);
    function close2Listener() {
      let rooms = localStorage.getItem('rooms');
      rooms = JSON.parse(rooms);
      let oldArr = rooms[roomsIndex].uniqueIds;
      let newArr = [];
      for (let i = 0; i < oldArr.length; ++i) {
        // fill new array with available ids
        if (!ids.includes(oldArr[i])) {
          newArr.push(oldArr[i]);
        }
      }
      rooms[roomsIndex].uniqueIds = newArr; // overwrite older uniqueIds array, strinigy and send to local storage
      let roomsString = JSON.stringify(rooms);
      localStorage.setItem('rooms', roomsString);
      roomsLeftBar[roomsIndex].refreshOwnIDSViaParam(newArr);
      roomsLeftBar[roomsIndex].click();
    }
    $('#menueModal').modal('show');
  }
  deleteWarning() {
    this.title.innerHTML = 'Warning';
    document.getElementById('deleteWarning').style.display = 'block';
    $('#menueModal').modal('show');

    // DECLARATION
    let btn1 = this.close2;
    let btn2 = this.close;

    btn1.innerHTML = 'no';
    btn1.style.display = 'block';
    btn2.innerHTML = 'yes';

    // CLOSE DETECTION FOR RESET
    let modal = document.getElementById('menueModal');
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      // reset
      btn1.style.diplay = 'none';
      btn2.innerHTML = 'Okay';
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
      btn2.removeEventListener('click', yesListener);
    }
    btn2.addEventListener('click', yesListener);
    function yesListener() {
      let rooms = getRooms();
      rooms.splice(currentRoomIndex, 1);
      setRooms(rooms);
      menueMain.click();
      refreshRooms();
    }
  }

  rename() {
    this.title.innerHTML = 'rename this room';
    this.close.innerHTML = 'apply';
    let content = document.getElementById('renameRoom');
    content.style.display = 'block';
    $('#menueModal').modal('show');

    let btn = this.close;
    let inp = document.getElementById('renameRoomInput');
    // CLOSE DETECTION FOR RESET
    let modal = document.getElementById('menueModal');
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      // reset
      btn.innerHTML = 'Okay';
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
      btn.removeEventListener('click', applyListener);
    }
    btn.addEventListener('click', applyListener);
    function applyListener() {
      let rooms = getRooms();
      let names = [];
      for (let elements of rooms) {
        names.push(elements.name);
      }
      if (
        !names.includes(inp.value) &&
        inp.value !== '' &&
        inp.value.length <= roomNameLength
      ) {
        rooms[currentRoomIndex].name = inp.value;
        setRooms(rooms);
        refreshRooms();
        roomsLeftBar[currentRoomIndex].click();
      }
    }
  }
  async addRoomLight() {
    this.title.innerHTML = 'choose light(s) to add';
    this.close.innerHTML = 'add';

    // get possible lights to add
    let allLights = [];
    await getData(
      'http://' + bridgeIP + '/api/' + apiKey + '/lights',
      settings.fetchTime
    ).then(async (data) => {
      for (let keys in data) {
        allLights.push(data[keys]['uniqueid']);
      }
    });
    let rooms = getRooms();
    let room = rooms[currentRoomIndex];
    let ids = room.uniqueIds;
    let devices = uniqueIdsToDevices(ids);
    let myLights = []; // unique Ids-list
    for (let lights of devices) {
      myLights.push(lights.returnUniqueID());
    }

    let finalLights = [];
    for (let i = 0; i < allLights.length; ++i) {
      if (!myLights.includes(allLights[i])) {
        finalLights.push(allLights[i]);
      }
    }
    let finalLightsNames = [];
    let finalLightsDevices = uniqueIdsToDevices(finalLights);
    for (let i = 0; i < finalLights.length; ++i) {
      finalLightsNames.push(finalLightsDevices[i].returnName());
    }

    // delete older bootstrapList elements of list and create new one
    for (let elements of lightsListAddToRoom) {
      elements.delete();
    }
    lightsListAddToRoom = [];
    document.getElementById('addLightRoom').style.display = 'block';
    for (let i = 0; i < finalLights.length; ++i) {
      lightsListAddToRoom.push(
        new BootstrapList('list_addLightRoom', null, finalLightsNames[i], i)
      );
      lightsListAddToRoom[i].create();
      lightsListAddToRoom[i].onClick_Listener();
    }
    $('#menueModal').modal('show');

    // config button for adding selection
    let modal = document.getElementById('menueModal');
    let btn = this.close;
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      btn.removeEventListener('click', addClick);
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
    }
    btn.addEventListener('click', addClick);
    function addClick() {
      let ids = rooms[currentRoomIndex].uniqueIds;
      let selectionNames = [];
      for (let elements of lightsListAddToRoom) {
        let res = elements.result('index'); // could also create bootstrap list with keys so no need for mode = "index"
        if (res !== null) {
          selectionNames.push(finalLights[res]);
        }
      }

      for (let i = 0; i < selectionNames.length; ++i) {
        ids.push(selectionNames[i]);
      }

      rooms[currentRoomIndex].uniqueIds = ids;
      setRooms(rooms);
      refreshRooms();
      roomsLeftBar[currentRoomIndex].click();
    }
  }

  async setAmbiance(mode) {
    // main modal for scenes / ambiances here (for individual lights or whole room)
    let isRGB;
    this.title.innerHTML = 'choose ambiance';
    this.close.innerHTML = 'apply';
    document.getElementById('setAmbiance').style.display = 'block';
    for (let elements of ambianceList) {
      elements.delete();
    }
    ambianceList = [];
    let options = [
      'desktop background sync' /*"desktop background sync - only dimming", "desktop audio sync", "desktop saturation sync"*/,
      'party',
      'calm forest',
      /*"calm ocean",*/ 'camp fire',
      'none',
    ];
    let ambiancesNames = [
      'background',
      /*"backgroundOnlyDimming",
      "audio",
      "saturation",*/
      'party',
      'forest',
      /*"ocean",*/
      'fire',
      'none',
    ];
    if (mode !== 'room') {
      isRGB = uniqueIdsToDevices(mode)[0].returnIsRGB() == null ? false : true;
      if (!isRGB) {
        options = ['desktop background sync', 'none'];
        ambiancesNames = ['background', 'none'];
      }
    }
    for (let i = 0; i < options.length; ++i) {
      ambianceList.push(
        new BootstrapList('list_setAmbiance_wrapper', null, options[i], i)
      );
      ambianceList[i].create();
      ambianceList[i].onClick_Listener('hideOthers');
    }
    if (mode === 'room') {
      let rooms = getRooms();
      let lastAmbiance = rooms[currentRoomIndex].lastRoomAmbiance;
      if (lastAmbiance !== undefined) {
        let foundIndex = ambiancesNames.indexOf(lastAmbiance);
        if (foundIndex >= 0) {
          ambianceList[foundIndex].click();
        }
      } else {
        ambianceList[ambiancesNames.indexOf('none')].click();
      }
    } else {
      let obj = await getCommunicatorJSON();
      let lightModeBefore = isRGB
        ? obj.activeSyncs.rgbLights[mode.replaceAll(':', '<COLON>')]
        : obj.activeSyncs.dimmableLights[mode.replaceAll(':', '<COLON>')]; //////////
      if (lightModeBefore && lightModeBefore.ambianceName) {
        ambianceList[
          ambiancesNames.indexOf(lightModeBefore.ambianceName)
        ].click();
      } else {
        ambianceList[ambiancesNames.indexOf('none')].click();
      }
    }

    // create btn events with close detection
    let modal = document.getElementById('menueModal');
    let btn = this.close;
    modal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
      btn.removeEventListener('click', applyClick);
      modal.removeEventListener('hidden.bs.modal', detectModalClose);
    }
    btn.addEventListener('click', applyClick);
    async function applyClick() {
      let finalAmbianceName = null;
      for (let i = 0; i < ambianceList.length; ++i) {
        if (ambianceList[i].result() !== null) {
          finalAmbianceName = ambiancesNames[i];
          break;
        }
      }
      if (finalAmbianceName !== null) {
        let obj = await getCommunicatorJSON();

        if (mode === 'room') {
          let myIDS = roomIndexToUniqueIds(currentRoomIndex); //
          let myDevices = uniqueIdsToDevices(myIDS); //

          let rooms = getRooms();
          rooms[currentRoomIndex].lastRoomAmbiance = finalAmbianceName;
          setRooms(rooms);
          for (let i = 0; i < myDevices.length; ++i) {
            let isRGB = myDevices[i].returnIsRGB();
            let isOn = myDevices[i].returnIsOn();
            if (isOn) {
              if (isRGB !== null) {
                let finalKey = IDToJSONID(isRGB);
                if (finalAmbianceName !== 'none') {
                  obj.activeSyncs.rgbLights[finalKey] = {};
                  obj.activeSyncs.rgbLights[finalKey].ambianceName =
                    finalAmbianceName;
                  obj.activeSyncs.rgbLights[finalKey].objectKey =
                    myDevices[i].returnKey(); // object key in api response list
                } else {
                  obj.activeSyncs.rgbLights[finalKey] = undefined;
                }
              } else {
                let finalKey = IDToJSONID(myDevices[i].returnUniqueID());
                console.log(finalKey);
                if (finalAmbianceName !== 'none') {
                  obj.activeSyncs.dimmableLights[finalKey] = {};
                  obj.activeSyncs.dimmableLights[finalKey].ambianceName =
                    finalAmbianceName;
                  obj.activeSyncs.dimmableLights[finalKey].objectKey =
                    myDevices[i].returnKey(); // object key in api response list
                } else {
                  obj.activeSyncs.dimmableLights[finalKey] = undefined;
                }
              }
            }
          }
        } else {
          let finalKey = IDToJSONID(mode);
          let myDevice = uniqueIdsToDevices(mode);
          if (finalAmbianceName !== 'none') {
            if (isRGB) {
              obj.activeSyncs.rgbLights[finalKey] = {}; // ()
              obj.activeSyncs.rgbLights[finalKey].ambianceName =
                finalAmbianceName;
              obj.activeSyncs.rgbLights[finalKey].objectKey =
                myDevice[0].returnKey();
            } else {
              obj.activeSyncs.dimmableLights[finalKey] = {}; // ()
              obj.activeSyncs.dimmableLights[finalKey].ambianceName =
                finalAmbianceName;
              obj.activeSyncs.dimmableLights[finalKey].objectKey =
                myDevice[0].returnKey();
            }
          } else {
            if (isRGB) {
              obj.activeSyncs.rgbLights[finalKey] = undefined;
            } else {
              obj.activeSyncs.dimmableLights[finalKey] = undefined;
            }
          }
        }
        await setCommunicatorJSON(obj);
      } else {
        // SHOULDNT HAPPEN --> deactivated unselecting all (?)
        if (mode === 'room') {
          let rooms = getRooms();
          rooms[currentRoomIndex].lastRoomAmbiance = undefined;
          setRooms(rooms);
        }
      }
    }

    $('#menueModal').modal('show');
  }
  addLight() {}
  bridge() {}
  general() {}
  updates() {}
}
let menueModal = new MenueModals();
menueModal.closeListener();

let lightsListAddToRoom = [];

let ambianceList = [];
