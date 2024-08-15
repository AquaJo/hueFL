let settings = {};
settings.fetchTime = 800; // timeout time in ms
settings.hideDropdownsOnNewOpen = true;
settings.scrollSpeed = 4;
settings.resetAmbiances = true;
// IF YA WANT TO KEEP STORAGE OF LAST SESSION --> OUTCOMMENT NEXT LINE PLS
//localStorage.clear();
settings.devModeNoPort = false; // to preserve localStorage, close the app only via the red cross of the main window & only run it via electron . (not npm start)
let devModeNoPortBackupRooms;
let devModeNoPortBackupLastRoom;
if (settings.devModeNoPort) {
  devModeNoPortBackupRooms = localStorage.getItem('rooms');
  devModeNoPortBackupLastRoom = localStorage.getItem('lastRoom');
  devModeNoPortSimulatedRooms = JSON.stringify([
    { name: 'ich', uniqueIds: ['1', '2'], lastRoomAmbiance: 'none' },
    { name: 'du', uniqueIds: ['2'] },
    { name: 'er/sie/es', uniqueIds: ['3'], lastRoomAmbiance: 'audio' },
    { name: 'alle', uniqueIds: ['1', '2', '3', '4'], lastRoomAmbiance: 'fire' },
    { name: 'funktionierend', uniqueIds: ['1', '2', '3'] },
  ]);
  localStorage.setItem('rooms', devModeNoPortSimulatedRooms);
  localStorage.setItem('lastRoom', '2');
}

// settings like exec Java --> find execJava boolean and change ...
