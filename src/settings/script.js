vex.defaultOptions.className = 'vex-theme-default';
let resetting = false;
function resetAmbiances() {
  resetting = true;
  if (
    defaults.Ambiances.AutomaticDimmableTurnOffBackgroundSync !==
    settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync
  ) {
    checkLuminanceTurnOff.click();
  }
  settings.Ambiances = defaults.Ambiances;
  inputsAndVars.forEach((pair) => {
    // --> later maybe with indexes
    let input = pair[0];
    let path = pair[1].split('.'); // only we need to know is its first parameter --> settings
    let variable = settings;
    console.log(settings);
    for (let i = 1; i < path.length; ++i) {
      // filtering value from path
      variable = variable[path[i]];
    }

    // set values
    input.value = Number(variable);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  resetting = false;
}

// DECLARE ELEMENTS
let checkLuminanceTurnOff = document.getElementById('checkLuminanceTurnOff');
let maxValueDimmablesBackgroundSync_Input = document.getElementById(
  'maxValueDimmablesBackgroundSync_Input'
);
let maxValueDimmablesBackgroundSync_Label = document.getElementById(
  'maxValueDimmablesBackgroundSync_Label'
);
let minValueDimmablesBackgroundSync_Input = document.getElementById(
  'minValueDimmablesBackgroundSync_Input'
);
let minValueDimmablesBackgroundSync_Label = document.getElementById(
  'minValueDimmablesBackgroundSync_Label'
);
let minLuminanceChangeRate_Input = document.getElementById(
  'minLuminanceChangeRate_Input'
);
let dimmableMultiplierBackgroundSync_Input = document.getElementById(
  'dimmableMultiplierBackgroundSync_Input'
);

let luminanceTresholdForTurnOffBackgroundSync_Input = document.getElementById(
  'luminanceTresholdForTurnOffBackgroundSync_Input'
);
// Basic local storage and other controll stuff
let settings;
//localStorage.removeItem("settings");
let defaults = JSON.parse(localStorage.getItem('settingsDefaults'));

updateSettings();
async function updateSettings() {
  // update local storage
  console.log(settings);
  if (settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  }
  //console.log(localStorage.getItem("settings"));
  settings = JSON.parse(localStorage.getItem('settings')); // for first set

  // set communicator json
  let communicatorObj = await getCommunicatorJSON();
  communicatorObj.generalSettings = {}; // reset to empty Object in case of not declared
  let communicatorObjSection = communicatorObj.generalSettings;
  communicatorObjSection = settings.Ambiances; // already parsed
  communicatorObj.generalSettings = communicatorObjSection; //...
  setCommunicatorJSON(communicatorObj); // set final obj
}

let inputsAndVars = [
  [
    document.getElementById('maxValueDimmablesBackgroundSync_Input'),
    'settings.Ambiances.maxDimmableBackgroundSync',
  ], // store variable as second parameter as string because needing object path for later on referring to it and not just it values --> no pointers in js
  [
    document.getElementById('minValueDimmablesBackgroundSync_Input'),
    'settings.Ambiances.minDimmableBackgroundSync',
  ],
  [
    document.getElementById('luminanceTresholdForTurnOffBackgroundSync_Input'),
    'settings.Ambiances.luminanceTresholdForTurnOffBackgroundSync',
  ],
  [
    document.getElementById('dimmableMultiplierBackgroundSync_Input'),
    'settings.Ambiances.dimmableMultiplierBackgroundSync',
  ],

  [
    document.getElementById('minLuminanceChangeRate_Input'),
    'settings.Ambiances.minLuminanceChangeRate',
  ],
  [
    document.getElementById('minRGBChangeRate_Input'),
    'settings.Ambiances.minRGBChangeRate',
  ],
];
// set and listen for value changes and update settings
inputsAndVars.forEach((pair) => {
  let input = pair[0];
  let path = pair[1].split('.'); // only we need to know is its first parameter --> settings
  let variable = settings;
  console.log(settings);
  for (let i = 1; i < path.length; ++i) {
    // filtering value from path
    variable = variable[path[i]];
  }

  // set values
  input.value = Number(variable);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  // listen for changes and update
  input.addEventListener('input', function () {
    if (path.length == 1) {
      // because for loop like before just sets it to a new variable again ...
      settings = Number(input.value);
    } else if (path.length == 2) {
      settings[path[1]] == Number(input.value);
    } else if (path.length == 3) {
      settings[path[1]][path[2]] = Number(input.value);
    } else if (path.length == 4) {
      settings[path[1]][path[2]][path[3]] = Number(input.value);
    } else if (path.length == 5) {
      settings[path[1]][path[2]][path[3]][path[4]] = Number(input.value);
    }
    updateSettings();
  });
});

// check and set

if (!settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync) {
  checkLuminanceTurnOff.click();
}
//

// LISTENERS FOR UPDATING SETTINGS

checkLuminanceTurnOff.addEventListener('click', function () {
  settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync =
    !settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync;
  updateSettings();
  if (resetting || !settings.Ambiances.AutomaticDimmableTurnOffBackgroundSync)
    return;
  vex.dialog.open({
    message:
      "Sorry, this feature won't do anything because its not implemented yet!",
    buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
  });
});

//

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
updates.addEventListener('click', function () {
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

document.getElementById('resetToDefaults').addEventListener('click', () => {
  resetAmbiances();
});
