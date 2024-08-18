<template>
  <p class="contentText" v-if="loading">Loading ...</p>
  <div v-else>
    <p class="contentText">Version: {{ version }}</p>
    <div v-if="foundRelease">
      <p class="contentText up10">
        Release:
        <a href="https://google.com" @click="linkClicked"
          >github/{{ owner }}/{{ repo }}</a
        >
      </p>
      <p class="contentText up10">
        Release-Date:
        <span class="tooltip-container white-underline"
          ><span class="tooltip-text">{{ timezoneString }}</span
          >{{ releaseDate }}</span
        >
      </p>
    </div>
    <p v-else class="contentText up10">Release: Couldn't find release</p>
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
import { ref, defineExpose } from 'vue';

const loading = ref(true);
const foundRelease = ref(false);
const owner = ref(null);
const repo = ref(null);
const version = ref(null);
const releaseDate = ref(null);
const timezoneString = ref(null);

function resetData() {
  loading.value = true;
  foundRelease.value = false;
  owner.value = null;
  repo.value = null;
  version.value = null;
  releaseDate.value = null;
  timezoneString.value = null;
}
async function update(ownerValOrFetchObj, repoValOrVersion, versionVal) {
  resetData();
  let data;
  if (ownerValOrFetchObj instanceof Object) {
    data = ownerValOrFetchObj;
    version.value = repoValOrVersion;
  } else {
    data = await reusableFetch(
      ownerValOrFetchObj,
      repoValOrVersion,
      versionVal
    );
    version.value = versionVal;
  }
  owner.value = data.owner;
  repo.value = data.repo;
  const success = data.success;
  if (!success) {
    loading.value = false;
    return;
  }
  // else success :]

  let arrayFetch = data.data;
  let versionObj = arrayFetch.find(
    (obj) => obj['tag_name'] === 'v' + version.value
  );
  releaseDate.value = formatISODateTime(versionObj['published_at']); // data[0] is the latest release
  setTimeout(() => {
    foundRelease.value = true;
    loading.value = false;
  }, 200);
}
async function reusableFetch(ownerVal, repoVal, versionVal) {
  let obj = {};
  obj.owner = ownerVal;
  obj.repo = repoVal;
  return await new Promise(async (resolve) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${ownerVal}/${repoVal}/releases`
      );
      if (!response.ok) {
        obj.success = false;
        resolve(obj);
      } else {
        const data = await response.json();

        obj.data = data;
        obj.success = true;
        resolve(obj);
      }
    } catch (err) {
      obj.success = false;
      resolve(obj);
      console.error('Error fetching releases:', err);
    }
  });
}
function linkClicked(event) {
  event.preventDefault();
  api.send(
    'openLink',
    'https://github.com/' +
      owner.value +
      '/' +
      repo.value +
      '/releases/tag/v' +
      version.value
  );
}

function formatISODateTime(isoString) {
  // Parse the ISO date string
  const date = new Date(isoString);

  // Define an array of month names
  const monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Extract the date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = monthAbbreviations[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Get the timezone offset in hours and minutes
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetHours = String(
    Math.floor(Math.abs(timezoneOffset) / 60)
  ).padStart(2, '0');
  const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
  const timezoneSign = timezoneOffset >= 0 ? '+' : '-';

  // Create timezone string
  timezoneString.value = `UTC ${timezoneSign}${offsetHours}:${offsetMinutes}`;

  // Format the final string
  return `${day}.${month} ${year} - ${hours}:${minutes}`;
}
defineExpose({
  update,
  reusableFetch,
});
</script>
