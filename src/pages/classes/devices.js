let roomsListAddLight = [];
let receiverSelectVisible = false;
let pickerCorrected = false;
let overlapsOff = false;
let senderLightSwappingID;
function modalColPickerCorrections() {
  if (!pickerCorrected) {
    pickerCorrected = true;

    let newDiv = document.createElement('div');
    let picker = document.getElementById('colorpickerModal');
    let inp = picker.children[2];
    let lowMenue = picker.children[3];
    //let spacing = document.createElement("hr");
    //spacing.style = "visibility: hidden; height:-30px";
    //newDiv.append(spacing)
    inp.style.position = 'relative';
    inp.style.top = '24px';
    newDiv.append(inp);
    newDiv.append(lowMenue);
    newDiv.style.width = '450px';
    newDiv.style.height = '110px';
    newDiv.style.marginTop = '-30px';
    newDiv.style.backgroundColor = 'black';
    picker.append(newDiv);
    let field = picker.children[1];
    field.style.width = '450px';
  }
}

class Devices {
  constructor(_key) {
    this.key = _key;

    this.element;

    this.titleElem;
    this.title;

    this.addRoomElement;

    this.switch;

    this.on;
    this.warning;
    this.isRGB;
    this.dropper;
    this.modals;

    this.isDimming;
    this.uniqueID;

    this.zIndex;

    this.ownRoomChangeOrderElement;
    this.receiverChangeOrderElement;
  }

  async create(_zIndex) {
    this.zIndex = _zIndex;
    // createclone
    this.element = document.getElementById('exampleLight').cloneNode(true);
    let element = this.element;
    element.removeAttribute('id');
    let cloneA = element.children[0].children[0].children[0];
    let inputClone = cloneA.children[0].cloneNode(true);
    //(multiple times fetching when creating from lists, lil bit inefficient but seperate)
    let title;
    let on;
    let warning;
    let bri;
    let rgb;
    let information;
    let uniqueID;
    await getData(
      'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + this.key,
      settings.fetchTime
    ) // 200 --> maybe higher
      .then(async (data) => {
        //get basic information + set global for this obj
        title = data['name'];
        uniqueID = data['uniqueid'];
        on = data['state']['on'];
        warning = !data['state']['reachable'];
        rgb = data['state']['hue'] === undefined ? false : true;
        bri = data['state']['bri']; // all devices? ...
        information = data;
        // create element based on this information
        inputClone.removeAttribute('id');
        if (on) {
          element.children[0].children[0].children[2].click();
        } else {
          // inputClone.disabled = true; // moved it to on - listener ... ---> didn't work
        }
        if (warning) {
          element.children[0].children[0].children[3].style.visibility =
            'visible';
        }
        homeMPage.appendChild(element);
        element.style.display = 'block';
      });
    this.element = element;
    this.title = title;
    this.titleElem = cloneA;
    this.addRoomElement = element.children[0].children[0].children[1];
    this.uniqueID = uniqueID;
    this.ownRoomChangeOrderElement =
      element.children[0].children[0].children[5];
    this.receiverChangeOrderElement =
      element.children[0].children[0].children[6];
    this.setTitle(title);

    // initialize Modals object
    this.modals = new this.Modals(this.key, title, uniqueID); // create Modals instance for later usage
    //

    this.on = on;
    this.warning = warning;
    this.isRGB = rgb;
    this.dropper = element.children[0].children[0].children[4];
    // this.dropper.children[0].style.zIndex = this.zIndex.toString() + "!important;"; //(!!)
    this.element.style.zIndex = this.zIndex;
    this.dropper.style.zIndex = this.zIndex;
    console.log(this.dropper.children[0]);
    if (!on) {
      this.disableStyling();
    }
    if (!rgb) {
      this.dropper.children[0].children[0].style.display = 'none';
    }

    let switchBtn = element.children[0].children[0].children[2];
    this.switch = switchBtn;

    let inp = this.element.children[0].children[0].children[0].children[0];
    inp.value = parseInt(bri);

    return 'finished';
  }
  disableStyling() {
    for (let i = 0; i < 2; ++i) {
      this.dropper.children[0].children[i].style.display = 'none';
    }
  }
  enableStyling() {
    // in case of rgb
    if (this.isRGB) {
      this.dropper.children[0].children[0].style.display = 'block';
    }
    this.dropper.children[0].children[1].style.display = 'block';
  }
  initializeDropper() {
    let menu = this.dropper;
    let self = this;
    if (!this.warning) {
      menu.style.left = '23px';
    }
    setTimeout(function () {
      let list = menu.children[0];
      menu.addEventListener('click', function () {
        list.classList.toggle('hidden');
      });
    }, 1000);
  }
  delete() {
    this.element.remove();
  }
  displayNone() {
    this.element.style.display = 'none';
  }
  displayBlock(inserting) {
    if (inserting) {
      let homePage = document.getElementById('home-mPage');
      homePage.insertBefore(this.element, homePage.children[3]); // insert direct after breakline(drag)-element
    }
    this.element.style.display = 'block';
  }
  visible() {
    this.element.style.visibility = 'visible';
  }
  hidden() {
    this.element.style.visibility = 'hidden';
  }

  offClick() {
    if (this.on) {
      this.switch.click(); // triggering off event through automatic clicking switch on of button in UI
      this.on = false;
    }
  }
  onClick() {
    if (!this.on) {
      this.switch.click();
      this.on = true;
    }
  }

  on_Listener() {
    let elem = this.element;
    let switchBtn = this.switch;
    let on = this.on;
    let key = this.key;
    //console.log(switchBtn);
    let self = this;
    let inp = elem.children[0].children[0].children[0].children[0];
    if (!this.on) {
      inp.disabled = true;
    }
    switchBtn.addEventListener('click', async function () {
      self.on = !self.on;
      //alert(id.substring(id.lastIndexOf("_")+1,id.length));
      let path =
        'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + key + '/state';
      console.log(path);
      inp = elem.children[0].children[0].children[0].children[0];
      if (self.on) {
        inp.disabled = false;
        self.enableStyling();
      } else {
        inp.disabled = true;
        self.disableStyling();
        // deleting uniqueId from object list in communicator.json
        let obj = await getCommunicatorJSON();
        if (self.isRGB) {
          obj.activeSyncs.rgbLights[IDToJSONID(self.uniqueID)] = undefined;
        } else {
          obj.activeSyncs.dimmableLights[IDToJSONID(self.uniqueID)] = undefined;
        }
        await setCommunicatorJSON(obj);
        //
      }
      await putData(path, { on: self.on }, settings.fetchTime) //
        .then(async (data) => {
          //console.log(data);
          //console.log(apiKey)
        });
    });
  }
  dim_Listener() {
    this.isDimming = true;
    //console.log(elem)
    let key = this.key;
    let elem = this.element;
    let inp = elem.children[0].children[0].children[0].children[0];
    //console.log(inp)
    inp.addEventListener('input', async function () {
      let val = parseInt(inp.value);
      let path =
        'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + key + '/state';
      setTimeout(async function () {
        if (val == parseInt(inp.value)) {
          await putData(path, { bri: val }, settings.fetchTime) //
            .then(async (data) => {
              //console.log(data);
              //console.log(apiKey)
            });
        }
      }, 200);
    });
  }

  main_Listener() {
    let modal = document.getElementById('exampleLightModal');
    let main = this.element.children[0].children[0].children[0];
    let title = this.title;
    let self = this;
    let startX;
    let startY;
    let nowX;
    let nowY;
    document.body.addEventListener('mousedown', function (e) {
      startY = e.pageY;
      startX = e.pageX;
    });
    document.addEventListener('mousemove', (event) => {
      nowX = event.clientX; // Gets Mouse X
      nowY = event.clientY; // Gets Mouse Y
    });

    main.addEventListener('click', function (e) {
      //alert(e.target === this);
      if (
        e.target !== this ||
        Math.abs(nowX - startX) > 5 ||
        Math.abs(nowY - startY) > 5
      )
        return;
      if (self.isRGB && self.on) {
        self.modals.colorpicker();
      } else {
        self.modals.information();
      }
      //
      /*const picker = new ColorPickerControl({ 
                container: document.body, 
                theme: 'light' 
            });
            let pickerElem = document.querySelector('body > div:last-of-type');
            pickerElem.setAttribute("id","colorPicker");
            pickerElem.style.position = "relative";
            $("#colorPicker").appendTo("#exampleLightModalText");*/
    });
  }
  setTitle(title) {
    let elemClone = this.titleElem;
    let inputClone = elemClone.children[0].cloneNode(true);
    elemClone.innerHTML = title; //
    this.title = title;
    elemClone.append(inputClone);
    this.titleElem = elemClone;

    if (this.isDimming) {
      this.dim_Listener();
    }
  }
  dropdownListener() {
    let self = this;

    this.dropper.addEventListener('click', function () {
      // main dropper
      if (settings.hideDropdownsOnNewOpen) {
        // hide every dropdown except this one
        for (let lamps of devicesHome) {
          lamps.hideDropdown(self.uniqueID); // hide all except the one with this (my) unique ID
          hideAllSingeDropdowns();
        }
      }
    });

    if (this.isRGB) {
      this.dropper.children[0].children[0].addEventListener(
        'click',
        function () {
          // set color
          self.modals.colorpicker();
        }
      );
      this.dropper.children[0].children[1].addEventListener(
        'click',
        function () {
          // set scene
          setAmbiance(self.uniqueID);
        }
      );
    } else {
      this.dropper.children[0].children[1].addEventListener(
        'click',
        function () {
          // set scene
          setAmbiance(self.uniqueID);
        }
      );
    }
    this.dropper.children[0].children[2].addEventListener(
      'click',
      async function () {
        // rename
        let responseRename = await self.modals.rename();
        if (responseRename !== null) {
          self.setTitle(responseRename);
        }
      }
    );
    this.dropper.children[0].children[3].addEventListener('click', function () {
      // get information
      self.modals.information();
    });
  }

  returnKey() {
    return this.key;
  }
  returnUniqueID() {
    return this.uniqueID;
  }
  returnName() {
    return this.title;
  }
  returnIsRGB() {
    if (this.isRGB) {
      return this.uniqueID;
    } else {
      return null;
    }
  }
  returnIsOn() {
    if (this.on) {
      return true;
    } else {
      return false; // because only true / false, not null ()
    }
  }
  setZIndex(zIndex) {
    this.zIndex = zIndex;
    this.element.style.zIndex = this.zIndex;
    this.dropper.style.zIndex = this.zIndex;
  }

  showAdd() {
    // change heiht and margin to fit again // to standard
    this.addRoomElement.style.visibility = 'visible';
    this.element.style.marginTop = '-30px';
    document.getElementById('hrBreakExampleLight').style.height = '5px';
  }
  hideAdd() {
    // no display none --> would disformat whole container
    this.addRoomElement.style.visibility = 'hidden';
    // automatic height and margin change to fit niclely into scrollable wrapper
    this.element.style.marginTop = '-60px';
    document.getElementById('hrBreakExampleLight').style.height = '35px';
  }
  showDeleteInDropdown() {
    this.dropper.children[0].children[4].style.display = 'block';
  }
  hideDeleteInDropdown() {
    this.dropper.children[0].children[4].style.display = 'none';
  }
  deleteDropdownListener() {
    let elem = this.dropper.children[0].children[4];
    let myID = this.uniqueID;
    elem.addEventListener('click', function () {
      let rooms = getRooms();
      let myRoom = rooms[currentRoomIndex];
      let idsList = myRoom.uniqueIds;
      idsList.splice(idsList.indexOf(myID), 1);
      myRoom.uniqueIds = idsList;
      setRooms(rooms);
      refreshRooms();
      roomsLeftBar[currentRoomIndex].click();
    });
  }

  addToRoom_Listener() {
    let addRoomA = this.element.children[0].children[0].children[1];
    let self = this;
    addRoomA.addEventListener('click', function () {
      if (window.getComputedStyle(addRoomA).visibility === 'visible') {
        for (let room of roomsListAddLight) {
          room.delete();
        }
        roomsListAddLight = [];
        self.modals.addToRoom(self.uniqueID);
        let rooms = localStorage.getItem('rooms');
        rooms = JSON.parse(rooms);
        for (let elements of rooms) {
          //!
          let title = elements.name;
          roomsListAddLight.push(
            new BootstrapList('list_addToRoom', null, title)
          );
          roomsListAddLight[roomsListAddLight.length - 1].create(); //!
          roomsListAddLight[roomsListAddLight.length - 1].onClick_Listener(); //!
        }
      }
    });
  }
  hideDropdown(id) {
    if (id !== this.uniqueID) {
      //
      let menu = this.dropper;
      let list = menu.children[0];
      let cL = list.classList;
      if (!cL.contains('hidden')) {
        list.classList.add('hidden');
      }

      //this.dropper.children[0].classList = "listdrop hidden";
    }
  }

  moveBarListener() {
    let self = this;
    let elm = this.element.children[0].children[0].children[0];
    let breakline = document.getElementById('breakLineDevicesMovement');
    let yListeningArea = document.getElementById('home-mPage');
    let iamSelected = false;

    /*let callback = function(entries, observer) {
            console.log(entries);
        }

        let options = {
            root: elm,
            rootMargin: '0px',
            threshold: 1.0
        }

        let observer = new IntersectionObserver(callback, options);
        let target = breakline;
        setInterval(function() {
            observer.observe(target);
        },1000)*/
    function elementsOverlap(el1, el2) {
      const domRect1 = el1.getBoundingClientRect();
      const domRect2 = el2.getBoundingClientRect();

      return !(
        domRect1.top > domRect2.bottom ||
        domRect1.right < domRect2.left ||
        domRect1.bottom < domRect2.top ||
        domRect1.left > domRect2.right
      );
    }
    let lastWasOverlapped = false;
    let intervalSeqTime = 'slow';
    let intervalSwapping; // could also have done it with timeouts --> no deleting required ..
    setSwappingInterval('slow');
    function setSwappingInterval(tempo) {
      intervalSwapping = setInterval(
        checkingSwapStatusInterValListener,
        tempo === 'slow' ? 700 : 80
      );
    }
    function checkingSwapStatusInterValListener() {
      if (
        overlapsOff ||
        window.getComputedStyle(breakline).visibility === 'visible'
      ) {
        if (intervalSeqTime === 'slow') {
          console.log('swapIntervalFast');
          intervalSeqTime = 'fast';
          clearInterval(intervalSwapping);
          setSwappingInterval('fast');
        }
        if (
          window.getComputedStyle(self.ownRoomChangeOrderElement).display ===
          'none'
        ) {
          if (
            elementsOverlap(elm, breakline) &&
            window.getComputedStyle(breakline).visibility === 'visible'
          ) {
            if (!lastWasOverlapped) {
              //()
              lastWasOverlapped = true;
            }
            self.showRequestSelect();
          } else if (lastWasOverlapped) {
            lastWasOverlapped = false;
            self.hideRequestSelect();
          }
        } else {
          if (receiverSelectVisible) {
            self.ownRoomChangeOrderElement.style.color = 'lime';
          } else {
            self.ownRoomChangeOrderElement.style.color = 'white';
          }
        }
      } else {
        if (intervalSeqTime === 'fast') {
          console.log('swapIntervalSlow');
          intervalSeqTime = 'slow';
          clearInterval(intervalSwapping);
          setSwappingInterval('slow');
          self.hideRequestSelect();
        }
      }
    }
    // MOUSE MOVE DIRECTION DETECTION
    let direction = '';
    let oldx = 0;
    let oldy = 0;
    let xSpeed;
    let ySpeed;
    function mousemovemethod(e) {
      if (e.pageX > oldx && e.pageY == oldy) {
        direction = 'East';
      } else if (e.pageX == oldx && e.pageY > oldy) {
        direction = 'South';
      } else if (e.pageX == oldx && e.pageY < oldy) {
        direction = 'North';
      } else if (e.pageX < oldx && e.pageY == oldy) {
        direction = 'West';
      }

      oldx = e.pageX;
      oldy = e.pageY;

      xSpeed = e.movementX;
      ySpeed = e.movementY;
    }

    elm.addEventListener('mousemove', mousemovemethod, true);
    //
    document.body.addEventListener('mouseup', function () {
      // all devices listening to this one simultanious ..... (!)
      setAllPointersOfOverlapsToBackUp();
      elm.removeEventListener('mouseleave', mouseLeaveEvent);
      yListeningArea.removeEventListener('mousemove', yDetectorBody); //
      breakline.style.visibility = 'hidden';
      self.hideSenderSelect();
      if (iamSelected) {
        // swapping my room with sender room
        let me = self.uniqueID;
        let other = senderLightSwappingID;
        let rooms = getRooms();
        let myRoom = rooms[currentRoomIndex];
        let myRoomIds = myRoom.uniqueIds;
        let myRoomIndex = myRoomIds.indexOf(me);
        let othersRoomIndex = myRoomIds.indexOf(other);
        [myRoomIds[myRoomIndex], myRoomIds[othersRoomIndex]] = [
          myRoomIds[othersRoomIndex],
          myRoomIds[myRoomIndex],
        ];
        setRooms(rooms);
        refreshRooms();
        roomsLeftBar[currentRoomIndex].click();
        iamSelected = false;
      }
    });

    let backUpsPointers;
    function disableAllPointersOfOverlaps() {
      backUpsPointers = [];
      let childs = self.element.children[0].children[0].children;
      for (let i = 1; i < childs.length; ++i) {
        backUpsPointers.push(window.getComputedStyle(childs[i]).pointerEvents);
        childs[i].style.pointerEvents = 'none';
      }
      overlapsOff = true;
    }

    function setAllPointersOfOverlapsToBackUp() {
      let childs = self.element.children[0].children[0].children;
      for (let i = 1; i < childs.length; ++i) {
        let item;
        if (backUpsPointers === undefined) {
          item = '';
        } else {
          item = backUpsPointers[i - 1];
        }
        let finalEvent = item === '' ? 'auto' : item;
        childs[i].style.pointerEvents = finalEvent;
      }
      overlapsOff = false;
    }
    elm.addEventListener('mousedown', function mouseDownListener(e) {
      disableAllPointersOfOverlaps();

      elm.addEventListener('mouseleave', mouseLeaveEvent);
    });
    function mouseLeaveEvent(e) {
      if (currentRoomIndex != undefined) {
        if (topOrBottom()) {
          yListeningArea.addEventListener('mousemove', yDetectorBody); // also deleted on mouseUP
          breakline.style.visibility = 'visible';
          self.showSenderSelect();
          self.ownRoomChangeOrderElement.style.color = 'white';
          senderLightSwappingID = self.uniqueID;
        }
      }
    }

    // seperated mouseleave && entered listener for selection recognition // results of swapping / dragging
    elm.addEventListener('mouseenter', function () {
      if (getComputedStyle(breakline).visibility === 'visible') {
        iamSelected = true;
      }
    });
    elm.addEventListener('mouseleave', function () {
      iamSelected = false;
    });
    //
    let barY;
    let downListenerActive = false;
    let upListenerActive = false;
    function yDetectorBody(e) {
      breakline.style.top = e.pageY + 'px';
      //console.log(e.pageY);
      barY = e.pageY;
      if (barY >= 590) {
        // reached bottom
        if (barY >= 603) {
          breakline.style.top = 603 + 'px';
        }
        if (
          getComputedStyle(breakline).visibility === 'visible' &&
          !downListenerActive
        ) {
          downListenerActive = true;
          let downScrollInterval = setInterval(downScrolling, 14); // (!)
          function downScrolling() {
            if (
              barY >= 590 &&
              getComputedStyle(breakline).visibility === 'visible'
            ) {
              yListeningArea.scrollBy({ top: settings.scrollSpeed });
            } else {
              clearInterval(downScrollInterval);
              downListenerActive = false;
            }
          }
        }
      }
      if (barY <= 125) {
        // reached bottom
        if (barY <= 112) {
          breakline.style.top = 112 + 'px';
        }
        if (
          getComputedStyle(breakline).visibility === 'visible' &&
          !upListenerActive
        ) {
          upListenerActive = true;
          let upScrollInterval = setInterval(upScrolling, 14); // (!)
          function upScrolling() {
            if (
              barY <= 125 &&
              getComputedStyle(breakline).visibility === 'visible'
            ) {
              yListeningArea.scrollBy({ top: -1 * settings.scrollSpeed });
            } else {
              clearInterval(upScrollInterval);
              upListenerActive = false;
            }
          }
        }
      }
    }

    function topOrBottom() {
      if (oldx > 260 && oldx < 767 && Math.abs(xSpeed) < 8) {
        return true;
      } else {
        return false;
      }
    }
  }

  showSenderSelect() {
    if (this.warning) {
      this.ownRoomChangeOrderElement.style.left = '43px';
    } else {
      this.ownRoomChangeOrderElement.style.left = '23px';
    }
    this.ownRoomChangeOrderElement.style.display = 'block';
  }
  hideSenderSelect() {
    this.ownRoomChangeOrderElement.style.display = 'none';
  }
  showRequestSelect() {
    this.receiverChangeOrderElement.style.display = 'block';
    receiverSelectVisible = true;
  }
  hideRequestSelect() {
    this.receiverChangeOrderElement.style.display = 'none';
    receiverSelectVisible = false;
  }
  Modals = class {
    //
    constructor(_key, _title, _uniqueID) {
      this.key = _key;
      this.uniqueID = _uniqueID;
      this.title = _title;

      this.close = document.getElementById('exampleLightModalCloseText');
      this.text = document.getElementById('exampleLightModalText');
      this.titleE = document.getElementById('exampleLightModalTitle');
    }
    reset() {
      document.getElementById('colorpickerModal').style.display = 'none'; // better solution ... ---> on bootstrap modal close / unfocuse.. (!!!)
      document.getElementById('exampleLightModalText').innerHTML = '';
      document.getElementById('renameModal').style.display = 'none';
      document.getElementById('exampleLightModalBody').style.textAlign = 'left';
      document.getElementById('addToRoomModal').style.display = 'none';
      document.getElementById('exampleLightModalCloseText2').style.display =
        'none';
    }
    async information() {
      this.reset();
      let key = this.key;
      let inf = await getInformation(); // first we need to get newest information protocoll of specific light with key
      async function getInformation() {
        let path = 'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + key;
        let res;
        await getData(path, settings.fetchTime).then(async (data) => {
          res = data;
        });
        return res;
      }
      let classLevel = 0; // set class level 0
      let text = [];
      informationClassDetection(classLevel, inf);
      function informationClassDetection(level, obj) {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            // check if object."key" is also an object so that a insertion has to happen
            // here? found a subclass!
            text.push([key, '', classLevel, true]);
            classLevel++; // add insertion
            informationClassDetection(classLevel, obj[key]); // loop to same function with "calculated" classLvl
          } else {
            // no ? ... --> proceed with same level
            text.push([key, obj[key], classLevel, false]);
          }
        }
        if (classLevel > 0) {
          classLevel--; // clear last insertion (if classLevel isn't already 0)
        }
      }
      let finalTxt = writeHTMLTextWithIdentation(text); // typus text = [[key,value,indent,isObject],[...]]
      function writeHTMLTextWithIdentation(text) {
        // use the found indentation for writing in my indentation style
        let res = '';
        for (let i = 0; i < text.length; ++i) {
          let indentLvl = text[i][2];
          let indent = indentLvl * 50 + 18;
          let keyCol = '3A6B35';
          if (text[i][3]) {
            keyCol = '00CED1';
          } else {
            if (indentLvl == 0) {
              keyCol = 'E3B448';
            } else if (indentLvl == 1) {
              keyCol = 'CBD18F';
            } else if (indentLvl == 2) {
              keyCol = '3A6B35';
            }
          }
          //res += '<p style = "text-indent:' + indent + 'px; line-height:4px; color:' + keyCol + '">' + text[i][0] + ":  " + '<span style = "color:#A8AAAA">' + text[i][1] + "</span>" + '</p>';
          res +=
            '<p class = "informationModalP indent_' +
            indentLvl +
            ' col_' +
            keyCol +
            '"' +
            '>' +
            text[i][0] +
            ':  ' +
            '<span class = "informationModalSpan" >' +
            text[i][1] +
            '</span>' +
            '</p>';
        }
        return res;
      }
      document.getElementById('exampleLightModalCloseText').innerHTML = 'Close';
      document.getElementById('exampleLightModalText').innerHTML =
        '<hr class = "informationHrBreak">' + finalTxt;
      document.getElementById('exampleLightModalTitle').innerHTML =
        this.title + ' - information';
      $('#exampleLightModal').modal('show');
    }
    async colorpicker() {
      this.reset();
      // deleting me from communicator.json (json to communicate with java --> responsilbe for fastly setting background/ audio syncs and other scenes) --> stop animation // for rgb and ... just in case I later add non rgb - scene support
      let obj = await getCommunicatorJSON();
      obj.activeSyncs.rgbLights[IDToJSONID(this.uniqueID)] = undefined;
      await setCommunicatorJSON(obj);
      //
      modalColPickerCorrections();
      // set colorpicker color based on rgb-lamp color
      let path =
        'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + this.key;
      let inp =
        document.getElementById('colorpickerModal').children[2].children[0];
      await getData(path, settings.fetchTime) //
        .then(async (data) => {
          let hex;
          let lastxy = localStorage.getItem('lastXY');
          if (lastxy === null) {
            lastxy = [0, 0];
          } else {
            lastxy = lastxy.split(',');
            lastxy[0] = Number(lastxy[0]);
            lastxy[1] = Number(lastxy[1]);
          }
          //console.log(lastxy)
          //console.log([data["state"]["xy"][0], data["state"]["xy"][1]]);
          function arrayEquals(a, b) {
            return (
              Array.isArray(a) &&
              Array.isArray(b) &&
              a.length === b.length &&
              a.every((val, index) => val === b[index])
            );
          }
          if (
            !arrayEquals(lastxy, [
              data['state']['xy'][0],
              data['state']['xy'][1],
            ])
          ) {
            hex = xyBriToRgb(
              data['state']['xy'][0],
              data['state']['xy'][1],
              255
            );
            //alert(hex);
          } else {
            hex = localStorage.getItem('lastHex');
          }
          inp.value = hex;
          inp.setAttribute('id', 'inputColorpickerModal');
          inp.click();
          inp.focus();
          inp.dispatchEvent(new Event('change', { bubbles: true })); // // // // // //
        });

      let modal = document.getElementById('exampleLightModal');
      modal.addEventListener('hidden.bs.modal', detectModalClose);
      let colPickerInterval = setInterval(colorPickerVarCheck, 130);
      function detectModalClose() {
        modal.removeEventListener('hidden.bs.modal', detectModalClose);
        clearInterval(colPickerInterval);
      }

      let col = 'dsa213gvs*!';
      function colorPickerVarCheck() {
        if (colorPickerColor !== col) {
          setTimeout(function () {
            if (col === colorPickerColor) {
              let xy = rgbToXY(col.rgb.r, col.rgb.g, col.rgb.b);
              putData(
                path + '/state',
                { xy: [xy[0], xy[1]] },
                settings.fetchTime
              ) //
                .then(async (data) => {
                  getData(path, settings.fetchTime) //
                    .then(async (data) => {
                      localStorage.setItem('lastXY', [
                        data['state']['xy'][0],
                        data['state']['xy'][1],
                      ]);
                      localStorage.setItem('lastHex', inp.value);
                    });
                });
            }
          }, 110);
        }
        col = colorPickerColor;
      }
      document.getElementById('exampleLightModalText').innerHTML = '';
      document.getElementById('exampleLightModalCloseText').innerHTML = 'Apply';
      document.getElementById('colorpickerModal').style.display = 'block';
      document.getElementById('exampleLightModalTitle').innerHTML =
        this.title + ' - colorpicker';
      $('#exampleLightModal').modal('show');
    }
    async rename(mode) {
      let self = this;
      return new Promise(function (resolve, reject) {
        self.reset();
        document.getElementById('exampleLightModalBody').style.textAlign =
          'center';
        let renameModal = document.getElementById('renameModal');
        renameModal.style.display = 'block';
        document.getElementById('exampleLightModalCloseText').innerHTML =
          'Apply';
        document.getElementById('exampleLightModalTitle').innerHTML =
          self.title + ' - rename';
        let inp = document.getElementById('renameModalInput');
        inp.value = '';
        $('#exampleLightModal').modal('show');
        let key = self.key;

        let close2 = document.getElementById('exampleLightModalCloseText');
        let modal = document.getElementById('exampleLightModal');
        modal.addEventListener('hidden.bs.modal', detectModalClose);
        function detectModalClose() {
          close2.removeEventListener('click', close2Listener);
          modal.removeEventListener('hidden.bs.modal', detectModalClose);
        }
        close2.addEventListener('click', close2Listener);
        async function close2Listener() {
          let path = 'http://' + bridgeIP + '/api/' + apiKey + '/lights/' + key; // ik
          let newName = renameModal.children[1].value;
          if (newName !== '') {
            //
            await putData(path, { name: newName }, settings.fetchTime).then(
              async (data) => {}
            );
            self.title = inp.value;
            resolve(inp.value);
          } else {
            resolve(null);
          }
        }
      });
    }
    addToRoom(myUniqueId) {
      this.reset();
      let close2 = document.getElementById('exampleLightModalCloseText2');
      let closeMain = document.getElementById('exampleLightModalCloseText');
      close2.innerHTML = 'create room';
      close2.style.display = 'block';
      document.getElementById('addToRoomModal').style.display = 'block';
      this.titleE.innerHTML = this.title + ' - add to room';
      this.close.innerHTML = 'add';
      $('#exampleLightModal').modal('show');

      // while in modal keep listening for create room button click and then delete listener again
      let modal = document.getElementById('exampleLightModal');
      modal.addEventListener('hidden.bs.modal', detectModalClose);
      function detectModalClose() {
        close2.removeEventListener('click', createRoomListener);
        closeMain.removeEventListener('click', appendToRoom);
        modal.removeEventListener('hidden.bs.modal', detectModalClose);
      }
      closeMain.addEventListener('click', appendToRoom);
      close2.addEventListener('click', createRoomListener);
      function createRoomListener() {
        document.getElementById('room_add').click(); // call required function for creation via automatic clicking add room element
        close2.removeEventListener('click', createRoomListener);
      }
      function appendToRoom() {
        let rooms = getRooms();
        let includingRooms = [];
        for (let i = 0; i < roomsListAddLight.length; ++i) {
          let res = roomsListAddLight[i].result();
          if (res !== null) {
            includingRooms.push(res);
          }
        }
        for (let elements of rooms) {
          if (includingRooms.includes(elements.name)) {
            let uniqueIdsList = elements.uniqueIds;
            if (!uniqueIdsList.includes(myUniqueId)) {
              elements.uniqueIds.push(myUniqueId);
            }
          }
        }

        setRooms(rooms);
        refreshRooms();
        closeMain.removeEventListener('click', appendToRoom); // ^^
      }
    }
  };
}

// convertion stuff
function rgbToXY(r, g, b) {
  let red = r;
  let green = g;
  let blue = b;

  let redC = red / 255;
  let greenC = green / 255;
  let blueC = blue / 255;

  let redN =
    redC > 0.04045
      ? Math.pow((redC + 0.055) / (1.0 + 0.055), 2.4)
      : redC / 12.92;
  let greenN =
    greenC > 0.04045
      ? Math.pow((greenC + 0.055) / (1.0 + 0.055), 2.4)
      : greenC / 12.92;
  let blueN =
    blueC > 0.04045
      ? Math.pow((blueC + 0.055) / (1.0 + 0.055), 2.4)
      : blueC / 12.92;

  let X = redN * 0.664511 + greenN * 0.154324 + blueN * 0.162028;

  let Y = redN * 0.283881 + greenN * 0.668433 + blueN * 0.047685;

  let Z = redN * 0.000088 + greenN * 0.07231 + blueN * 0.986039;

  let x = X / (X + Y + Z);

  let y = Y / (X + Y + Z);
  X = x * 65536;
  Y = y * 65536;

  return [x, y];
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
  return {
    r: r,
    g: g,
    b: b,
  };
}
