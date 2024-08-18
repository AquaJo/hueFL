// javascript for handling elements according their css classes // only working for elements available on start
let all = document.getElementsByTagName('*');
let switches = [];
let inputRanges = [];
let expands = [];
const switchMap = new Map();
const inputRangeMap = new Map();
const expandsMap = new Map();

let questionMarkExists = false;
for (let i = 0, max = all.length; i < max; ++i) {
  // check all elements
  let element = all[i];
  element.classList.forEach((className) => {
    if (className.includes('check')) {
      // check for checkboxes and their childs
      let switchNum = className.split('check')[1].split('_')[0];
      if (className.includes('_')) {
        let mapArr = switchMap.get(switchNum);
        if (!mapArr) {
          mapArr = [];
        }
        mapArr.push(element);
        switchMap.set(switchNum, mapArr);
      } else {
        switches.push([element, switchNum]);
        element.addEventListener('click', function () {
          // add click eventlistener for main switch
          let myElements = switchMap.get(switchNum);
          if (element.checked) {
            // add properties for each nelement being under control a checked toggle
            myElements.forEach((elm) => {
              elm.style.filter = 'brightness(100%)';
              if (elm.tagName === 'INPUT') {
                // if input then also activate it
                elm.disabled = false;
              }
            });
          } else {
            let myElements = switchMap.get(switchNum);
            myElements.forEach((elm) => {
              elm.style.filter = 'brightness(75%)';
              if (elm.tagName === 'INPUT') {
                // if input then also activate it
                elm.disabled = true;
              }
            });
          }
        });
      }
    }
    if (className.includes('inputRange')) {
      let inputRangeNum = className.split('inputRange')[1].split('_')[0];
      if (className.includes('_')) {
        let mapArr = inputRangeMap.get(inputRangeNum);
        if (!mapArr) {
          mapArr = [];
        }
        mapArr.push(element);
        inputRangeMap.set(inputRangeNum, mapArr);
      } else if (!className.includes('inputRangeLabel')) {
        inputRanges.push([element, inputRangeNum]);
        // rest is done in seperate for - loop, to set labels direct after this for - loop
      }
    }
    if (className.includes('expand')) {
      let expandNum = className.split('expand')[1].split('_')[0];
      if (className.includes('_')) {
        let mapArr = expandsMap.get(expandNum);
        if (!mapArr) {
          mapArr = [];
        }
        mapArr.push(element);
        expandsMap.set(expandNum, mapArr);
      } else {
        expands.push([element, expandNum]);
        // rest is done in seperate for - loop, to set labels direct after this for - loop
      }
    }
    if (className === 'questionMarkImg' && !questionMarkExists) {
      questionMarkExists = true;
      $(document).ready(function () {
        $('[data-toggle="popover"]').popover();
      });
    }
  });
}

for (let i = 0; i < expands.length; ++i) {
  let element = expands[i][0];
  let myElements = expandsMap.get(expands[i][1]);
  myElements.forEach((elm) => {
    // on start hide all children by default --> not expanded
    elm.style.display = 'none';
  });
  let expanded = false;
  let expandImg = element.children[0].children[0].children[0];

  let mainButton = element.children[0];
  mainButton.addEventListener('mouseover', function () {
    // color of chrome material icon on hovering
    expandImg.style.color = '#FFCC00';
  });
  mainButton.addEventListener('mouseleave', function () {
    if (expandImg.innerHTML === 'expand_more') {
      // reset color only when not expended
      expandImg.style.color = null;
    }
  });
  mainButton.addEventListener('click', function () {
    // on expand / shrink click do according hiding / blocking
    if (expanded) {
      expandImg.innerHTML = 'expand_more';
      expandImg.style.color = null; // could also not reset color here --> own opinion wheter reset or not
    } else {
      expandImg.innerHTML = 'expand_less';
      expandImg.style.color = '#FFCC00'; // keep color of image while open
    }
    myElements.forEach((elm) => {
      if (expanded) {
        elm.style.display = 'none';
      } else {
        elm.style.display = 'block';
      }
    });
    expanded = !expanded;
  });
}
for (let i = 0; i < inputRanges.length; ++i) {
  console.log(inputRanges);
  let element = inputRanges[i][0];
  let myElements = inputRangeMap.get(inputRanges[i][1]);
  myElements.forEach((elm) => {
    // declare values on start --> because of that in seperate for loop
    elm.innerHTML = element.value;
  });
  element.addEventListener('input', function () {
    // add input listener for setting label afterwards on change / (better) input
    myElements.forEach((elm) => {
      elm.innerHTML = element.value;
    });
  });
}
