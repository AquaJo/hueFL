document.getElementById('close').addEventListener('click', function () {
  api.send('closeSettings', []);
});

let general = document.getElementById('general');
let bridge = document.getElementById('bridge');
let updates = document.getElementById('updates');
let generalContent = document.getElementById('generalContent');
let bridgeContent = document.getElementById('bridgeContent');
let updatesContent = document.getElementById('updatesContent');
let contents = [generalContent, bridgeContent, updatesContent];

let settingsOptions = [general, bridge, updates]; //
general.addEventListener('click', function () {
  toggleAll(general);
  toggleContents(generalContent);
});
bridge.addEventListener('click', function (e) {
  //toggleAll(bridge);
  //toggleContents(bridgeContent);
  e.preventDefault();
  vex.dialog.open({
    message: 'Sorry, this feature is not implemented yet!',
    buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
  });
});
updates.addEventListener('click', async function () {
  toggleAll(updates);
  toggleContents(updatesContent);
});

if (localStorage.getItem('currentSettingsOption') === 'general') {
  general.click();
} else if (localStorage.getItem('currentSettingsOption') === 'bridge') {
  bridge.click();
} else {
  updates.click();
}

function toggleAll(elm) {
  // activate given element and deactivate all others
  settingsOptions.forEach((element) => {
    element.classList.remove('active');
    element.classList.add('text-white');
  });
  elm.classList.add('active');
}
function toggleContents(elm) {
  contents.forEach((element) => {
    element.style.display = 'none';
  });
  elm.style.display = 'block';
  document.getElementById('settingsContent').style.display = 'block'; // on first load its none because first elements are visible on standard, --> no flickering of elements
}
