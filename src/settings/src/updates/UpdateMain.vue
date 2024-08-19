<template>
  <div class="local">
    <p class="subtitleContent">Local</p>
    <div class="contentDiv">
      <p class="contentTextTitle">Current Version</p>
      <hr class="smallhr" width="75%" />
      <VersionStat ref="currentVersionStat"></VersionStat>
      <hr class="smallhr" width="75%" />
      <div v-if="remotePossible && installButtonText" class="btnDiv reset">
        <a
          id="installBtn"
          @click="installBtnClick"
          @mouseover="hoverInstall = true"
          @mouseleave="hoverInstall = false"
          class="brk-btn"
        >
          {{ installButtonText }}
          <label>
            <i
              class="material-icons installImgUpdates"
              :style="{
                color: hoverInstall ? '#FFCC00' : installCloudColor,
              }"
              >&#xe2c0;</i
            ></label
          ></a
        >
      </div>
    </div>
  </div>
  <div v-if="remotePossible" class="remote">
    <div class="contentDiv">
      <div class="btnDiv expand2">
        <a
          @click="showRemotes = !showRemotes"
          @mouseover="hoverExpand2 = true"
          @mouseleave="hoverExpand2 = false"
          class="brk-btn"
        >
          show remote versions
          <label>
            <i
              class="material-icons advancedSettingsImg"
              :style="{
                color:
                  hoverExpand2 || showRemotes
                    ? '#FFCC00'
                    : 'rgb(164, 174, 173)',
              }"
              >{{ showRemotes ? 'expand_less' : 'expand_more' }}</i
            >
          </label>
        </a>
      </div>
      <hr style="height: 3px; visibility: hidden" />
      <div
        v-memo="versionsRef"
        v-if="showRemotes"
        v-for="version in versionsRef"
        :key="version"
      >
        <p class="contentTextTitle">v{{ version }}</p>
        <hr class="smallhr" width="75%" />
        <VersionStat
          :ref="(el) => updateMe(el, version)"
          :id="'versionStat-' + version"
        ></VersionStat>
        <hr class="smallhr" width="75%" />
        <hr style="height: 1px; visibility: hidden" />
      </div>
    </div>
  </div>
</template>
<style>
.contentText.up10 {
  margin-top: -10px;
}
.contentText.up10.white-underline {
  position: relative;
}
.white-underline {
  position: relative;
  display: inline-block; /* Damit sich das Pseudoelement auf den Text bezieht */
}
.white-underline::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 3px;
  width: 100%;
  height: 1px;
  background-color: rgb(164, 174, 173);
  transform-origin: bottom;
  transition: background-color 0.3s ease;
}

.white-underline:hover::before {
  background-color: burlywood;
}

.tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: #fff;
  color: #333;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 170%; /* Position above the tooltip container */
  left: 50%;
  margin-left: -60px; /* Center the tooltip text */
  opacity: 0;
  transition:
    opacity 0.3s ease,
    bottom 0.3s ease;
}
.tooltip-container {
  cursor: help;
}
.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  bottom: 120%; /* Show tooltip directly above the container */
}
</style>

<script setup>
import { ref, defineExpose, watch, nextTick } from 'vue';
import VersionStat from './VersionStat.vue';
const hoverExpand2 = ref(false);
const hoverInstall = ref(false);
const showRemotes = ref(false);
const installCloudColor = ref('rgb(164, 174, 173)');
const installButtonText = ref(null);
let installButtonResponse = null;

const currentVersionStat = ref(null);
const remotePossible = ref(false);
const versionsRef = ref([]);

let owner;
let repo;
let reusableFetchObj;
let startCounter = 0;
async function start() {
  if (startCounter > 0) return; // not really needed to call it everytime, but you can - on each settings-page opening it gets loaded once seems enough actually ...
  versionsRef.value = [];
  startCounter++;
  let obj = await api.send('currentVersionInfo');
  const version = obj.version;
  owner = obj.owner;
  repo = obj.repo;
  reusableFetchObj = await currentVersionStat.value.reusableFetch(owner, repo); // just use this on one instance to get an reusable github fetch object
  console.log(reusableFetchObj);
  if (reusableFetchObj.success) {
    let versions = reusableFetchObj.data.map((obj) =>
      obj['tag_name'].replace('v', '')
    );

    versionsRef.value = versions;

    remotePossible.value = true;
    setInstallButton(version, versions[0], reusableFetchObj.data[0].prerelease);
  } else {
    remotePossible.value = false;
  }

  currentVersionStat.value.update(reusableFetchObj, version); // update(fetchObj, version) OR update(owner, repo, version)
}
async function setInstallButton(versionMe, versionRemote, prerelease) {
  installButtonResponse = {};
  const comparedVersionResult = compareVersions(versionRemote, versionMe);
  console.log(versionMe, versionRemote, prerelease);
  if (comparedVersionResult > 0 && !prerelease) {
    installButtonText.value = 'Install newest version';
    installButtonResponse.status = 'available';
  } else if (comparedVersionResult == 0) {
    installButtonText.value = 'Up to date';
    installCloudColor.value = 'rgb(96,133,93)';
    installButtonResponse.status = 'not-available';
  } else {
    installButtonText.value = 'error finding status';
    installCloudColor.value = '#F90B31';
    installButtonResponse.status = 'error'; // error message not needed so far
  }
  console.log(installButtonResponse);
  /* installButtonResponse = await api.send('upToDateCheck');
  const response = installButtonResponse;
  if (response.status === 'available') {
    installButtonText.value = 'Install newest version';
  } else if (response.status === 'not-available') {
    installButtonText.value = 'Up to date';
    installCloudColor.value = 'rgb(96,133,93)';
  } else if (response.status === 'error') {
    installButtonText.value = 'error finding status';
    installCloudColor.value = '#F90B31';
  } else if (response.status === 'dev') {
    installButtonText.value = 'in dev mode';
    installCloudColor.value = '#111111';
    installCloudColor.value = '#191919';
  } */
  // NOT DOING THIS ANYMORE BC EVERY upToDateCheck this way will download the build already EACH TIME!
}
function installBtnClick() {
  if (!installButtonResponse.status) return;
  if (installButtonResponse.status === 'available') {
    vex.dialog.open({
      message: 'Do you want to start an automated Download and Install?',
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
        $.extend({}, vex.dialog.buttons.NO, { text: 'No' }),
      ],
      callback: function (yes) {
        if (!yes) return;
        animateInstallBtn();
        api.send('installNewest');
      },
    });
  } else if (installButtonResponse.status === 'not-available') {
    vex.dialog.open({
      message: 'You are already up to date! :)',
      buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
    });
  } else if (installButtonResponse.status === 'dev') {
    vex.dialog.open({
      message: 'you should be in dev mode rn ... :)',
      buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
    });
  } else if (installButtonResponse.status === 'downloading') {
    vex.dialog.open({
      message:
        'We are currently in the process of downloading the update. After that an install will start.',
      buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
    });
  }
}
let installBtnAnimationInterval;
function animateInstallBtn() {
  installButtonResponse.status = 'downloading';
  document.getElementById('installBtn');
  installButtonText.value = 'Downloading ...';
  installBtnAnimationInterval = setInterval(function () {
    installBtn.classList.toggle('hover');
  }, 490);
}
function deanimateInstallBtn() {
  installButtonResponse.status = 'available';
  clearInterval(installBtnAnimationInterval);
  installBtn.classList.remove('hover');
  installButtonText.value = 'Install newest version';
}
const updateMe = (element, version) => {
  if (element) {
    // can be null when it gets deleted ...
    element.update(reusableFetchObj, version);
  }
};

function compareVersions(version1, version2) {
  // > 0 --> version1 param is a newer version tag, ...
  // maybe class worthy
  // Split the version strings into arrays of numbers
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  // Pad the shorter version array with zeros
  while (v1Parts.length < v2Parts.length) v1Parts.push(0);
  while (v2Parts.length < v1Parts.length) v2Parts.push(0);

  // Compare each part of the version numbers
  for (let i = 0; i < v1Parts.length; i++) {
    if (v1Parts[i] > v2Parts[i]) {
      return 1; // version1 is newer
    } else if (v1Parts[i] < v2Parts[i]) {
      return -1; // version2 is newer
    }
  }

  return 0; // Both versions are the same
}

electron.onLog((event, message) => {
  if (message === 'updateNotYetRecognized') {
    deanimateInstallBtn();
    vex.dialog.open({
      message:
        'Electron-Updater maybe needs a bit longer to recognize the new release. Feel free to try again in a few minutes.',
      buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
    });
  } else if (message === 'updateNotYetRecognizedError') {
    deanimateInstallBtn();
    vex.dialog.open({
      message:
        'Electron-Updater sent an error even a new release is detected. Thats unexpected. :(',
      buttons: [$.extend({}, vex.dialog.buttons.YES, { text: 'close' })],
    });
  }
});
defineExpose({
  start,
});
</script>
