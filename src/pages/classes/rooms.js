let firstRoomClickOver = false;
class Rooms {
  constructor(_roomsIndex) {
    this.roomElement = document.getElementById('roomsDivRooms_leftbar');
    this.roomsIndex = _roomsIndex;
    this.myIDS;
    this.element;
  }
  create() {
    let rooms = localStorage.getItem('rooms');
    if (rooms !== null) {
      rooms = JSON.parse(rooms);
      let obj = rooms[this.roomsIndex];
      let roomClone = document.getElementById('roomsExample').cloneNode(true);
      roomClone.classList.remove('hiddenOwn');
      roomClone.children[0].innerHTML = obj.name;
      this.roomElement.children[0].append(roomClone);
      this.element = roomClone;
      this.myIDS = obj.uniqueIds;
    }
  }

  onClick_Listener() {
    let self = this;
    this.element.addEventListener('click', function () {
      if (firstRoomClickOver) {
        for (lamps of devicesHome) {
          lamps.hideDropdown(); // maybe own function for hiding all dropdowns (!) ()
        }
        //
        hideAllSingeDropdowns();
        //
        let list = document.getElementById('roomsMenueListDrop');
        let cL = list.classList;
        if (!cL.contains('hidden')) {
          list.classList.add('hidden');
        }
      } else {
        firstRoomClickOver = true;
      }

      currentRoomIndex = self.roomsIndex;
      showRoomsMenue();
      localStorage.setItem('lastRoom', self.roomsIndex + 1);
      self.activateOnlyMe();
      let existingIDS = [];

      for (let lamp of devicesHome) {
        let id = lamp.returnUniqueID();
        console.log(id);
        if (self.myIDS.includes(id)) {
          existingIDS.push(id);

          //lamp.displayBlock();
          lamp.hideAdd();
          lamp.showDeleteInDropdown();
        } else {
          //lamp.displayNone();
        }
      }
      if (existingIDS.length != self.myIDS.length) {
        let notFoundIPS = [];
        for (let i = 0; i < self.myIDS.length; ++i) {
          if (!existingIDS.includes(self.myIDS[i])) {
            notFoundIPS.push(self.myIDS[i]);
          }
        }
        menueModal.IDNotFound(notFoundIPS, self.roomsIndex);
        showLightsInOrder(existingIDS); // FIX --> update lights ...
      } else {
        console.log(self.myIDS);
        showLightsInOrder(self.myIDS);
      }
    });
  }
  refreshOwnIDSViaParam(newIDS) {
    this.myIDS = newIDS;
  }
  click() {
    this.element.click();
  }
  activateOnlyMe() {
    // deactivate all upper buttons && deactivate all rooms-buttons
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

    // activate own button
    let elem = this.element.children[0];
    if (!elem.classList.contains('active')) {
      elem.classList.remove('text-white');
      elem.classList.add('active');
    }
  }
  delete() {
    this.element.remove();
  }
  deactivate() {
    let elem = this.element.children[0];
    if (elem.classList.contains('active')) {
      elem.classList.remove('active');
      elem.classList.add('text-white');
    }
  }

  dragListener() {
    let self = this;
    let areaParent = document.getElementById('roomsDivRooms_leftbar');
    let me = this.element;
    let mouseDownOnMe = false;

    roomsArea.addEventListener('mouseenter', function () {
      me.addEventListener('mousedown', mouseDown);
      areaParent.addEventListener('mouseup', mouseUpParent);
      me.addEventListener('mouseleave', mouseLeave);
      me.addEventListener('mouseup', mouseUp);
      me.addEventListener('mouseenter', mouseEnter);
    });
    roomsArea.addEventListener('mouseleave', function () {
      me.removeEventListener('mousedown', mouseDown);
      areaParent.removeEventListener('mouseup', mouseUpParent);
      me.removeEventListener('mouseleave', mouseLeave);
      me.removeEventListener('mouseup', mouseUp);
      me.removeEventListener('mouseenter', mouseEnter);
      mouseDownOnMe = false;
    });
    function mouseEnter() {
      if (roomsDrag.alert && !mouseDownOnMe) {
        me.children[0].style.background = 'grey';
      }
    }
    function mouseDown() {
      mouseDownOnMe = true;
    }
    function mouseUp() {
      if (roomsDrag.alert && roomsDrag.notApplying) {
        roomsDrag.notApplying = false;
        let rooms = getRooms();
        let otherIndex = roomsDrag.from;
        let myIndex = self.roomsIndex;
        // swapping
        let currentFocusedName =
          currentRoomIndex === undefined ? null : rooms[currentRoomIndex].name;
        [rooms[myIndex], rooms[otherIndex]] = [
          rooms[otherIndex],
          rooms[myIndex],
        ];
        setRooms(rooms);
        console.log(currentFocusedName);

        refreshRooms(
          currentFocusedName === null ? undefined : currentFocusedName
        );

        roomsDrag.notApplying = true;
      }
    }
    function mouseUpParent() {
      mouseDownOnMe = false;
    }
    function mouseLeave() {
      if (mouseDownOnMe) {
        roomsDrag.alert = true;
        roomsDrag.from = self.roomsIndex;
      } else {
        me.children[0].style.background = '';
      }
    }
  }
}
let roomsDrag = {};
roomsDrag.notApplying = true;
let roomsLeftBar = [];

let roomsArea = document.getElementById('roomsDivRooms_leftbar');
roomsArea.addEventListener('mouseenter', function () {
  // activate listeners // future
});
roomsArea.addEventListener('mouseleave', function () {
  roomsDrag.alert = false;
});
roomsArea.addEventListener('mouseup', function () {
  roomsDrag.alert = false;
});
