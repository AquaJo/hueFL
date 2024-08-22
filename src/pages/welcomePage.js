document.getElementById('connectingViaIp').addEventListener('click', btnViaIP);
document
  .getElementById('autoConnecting')
  .addEventListener('click', findBridgeIP);

let foundIP = false;
async function findBridgeIP() {
  welcomePage.style.display = 'none';
  ipFinderPage.style.display = 'block';
  let ip = await finalIPProcess();
  ipFinderPage.style.display = 'none';
  ipFinderResPage.style.display = 'block';
  let resTitle = document.getElementById('p_resTitle_ipFinderRes');
  let resIPText = document.getElementById('p_resIPText_ipFinderRes');

  let btnBack = document.getElementById('btn_back_ipFinderRes');
  let btnContinue = document.getElementById('btn_continue_ipFinderRes');
  if (ip === 'notFound') {
    foundIP = false;
    resTitle.style.marginTop = '160px';
    btnContinue.className = 'btn btn-secondary';
    resTitle.innerHTML = "couldn't find IP";
  } else {
    foundIP = true;
    btnContinue.className = 'btn btn-success';
    resTitle.innerHTML = 'found bridge IP';
    resIPText.innerHTML = 'IP-address: ' + ip;
    localStorage.setItem('bridgeIP', ip);
    document.getElementById('p_iterate_ipFinder').innerHTML = 0;
  }
}

//$('[data-toggle="popover"]').popover();
let mainModalTitle = document.getElementById('mainModalTitle');
let mainModalText = document.getElementById('mainModalText');
checkIPAlready = false;
async function btnViaIP() {
  if (!checkIPAlready) {
    checkIPAlready = true;
    let input = document.getElementById('IPInput');
    let btn = document.getElementById('connectingViaIp');
    let testIP = input.value;
    let finalIP = await checkIP(testIP);
    if (finalIP === 'notWorking') {
      mainModalTitle.innerHTML = 'IP failed';
      mainModalText.innerHTML =
        'You can find the IP in your network settings e.g fritz.box \nIf not already tried, run the automatic hue-bridge finder';
      $('#mainModal').modal('show');
    } else {
      input.value = '';
      localStorage.setItem('bridgeIP', finalIP);
      welcomePage.style.display = 'none';
      initializeBridgeAuth();
    }
    checkIPAlready = false;
  }
}

async function checkIP(ip) {
  let finalIP;
  try {
    // filtering IP
    finalIP = ip.split('http://'); // deleting possible http:// at the beginning
    if (finalIP.length > 1) {
      finalIP = finalIP[1];
    } else if (finalIP.length == 1) {
      finalIP = finalIP[0];
    }
    if (finalIP.charAt(finalIP.length - 1) === '/') {
      finalIP = finalIP.substring(0, finalIP.length - 1);
    }
    await getData(
      'http://' + finalIP + '/api/thisIsAhueFLRequest',
      settings.fetchTime
    ) // 200 --> maybe higher
      .then(async (data) => {
        console.log(data[0].error.description);
        if (data[0].error.description.includes('unauthorized')) {
        } else {
          finalIP = 'notWorking';
        }
      });
  } catch (err) {
    //console.log(err);

    finalIP = 'notWorking';
  }
  return finalIP;
}

async function finalIPProcess() {
  /*
  firstly it gets your own IP,
  then it assumes, only the last block of the IP is important (not always the case!) to define the Hue Bridge's IP
  and requests are then send to every possible IP's with changes in the last block ,
  Timeout/ false-/ hue- responses are possible
  */

  let myIP = await ownIP();

  let ipBase = myIP.substring(0, myIP.lastIndexOf('.') + 1);
  //let lastBlock = myIP.substring(ipBase.length,myIP.length);
  let lastBlock; // not me but the bridge's one
  let bridgeIP;
  let counter = 0;
  let found = false;
  await tryReq(counter);

  async function tryReq(counter) {
    try {
      getData(
        'http://' + ipBase + counter + '/api/thisIsAhueFLRequest',
        settings.fetchTime
      ) // ASYNC
        .then(async (data) => {
          try {
            if (data[0].error.description.includes('unauthorized')) {
              lastBlock = counter;
              bridgeIP = ipBase + lastBlock;
              found = true;
              //return bridgeIP;
            }
          } catch (err) {}
          console.log('counter: ' + counter + '  finished');
          try {
            console.log(data);
          } catch (err) {
            data = '0';
          }
        });
    } catch (err) {
      //
      console.log('counter: ' + counter + '  finished');
    }
    await sleep(200);
    //alert("newC");
    //------
    if (counter < 255 && !found) {
      counter++;
      try {
        document.getElementById('p_iterate_ipFinder').innerHTML = counter;
      } catch (err) {}
      await tryReq(counter);
    } else if (!found) {
      //
      await sleep(900);
      if (!found) {
        bridgeIP = 'notFound';
      }

      //return bridgeIP;
    } else if (found) {
    }
  }
  return bridgeIP;
}

async function ownIP() {
  return await api.send('ip', '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

vex.defaultOptions.className = 'vex-theme-default';
// keypress-detector
let manualLoginOpen = false; // only one UI-Elements of this kind and this purpose at once
document.addEventListener('keydown', async (event) => {
  if (event.keyCode === 75) {
    if (
      !manualLoginOpen &&
      window.getComputedStyle(welcomePage).display === 'block'
    ) {
      open();
      function open() {
        manualLoginOpen = true;
        vex.dialog.open({
          message: 'enter bridge IP and api key',
          input: [
            '<input class = "IpInputVex"name="IP" type="text" placeholder="IP" required />',
            '<input name="apiKey" type="password" placeholder="Api-Key" required />',
          ].join(''),
          buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'Login' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Cancle' }),
          ],
          callback: async function (data) {
            if (!data) {
              manualLoginOpen = false;
              //open(); // don't open it again if user cancels! (but keep the option of reopening ... )
            } else {
              let ip = data.IP;
              if (ip !== undefined) {
                ipIsValid = await checkIP(ip);
                if (ipIsValid === 'notWorking') {
                  console.log('IP is incorrect');
                  ipIsValid = false;

                  manualLoginOpen = false;
                  open();
                } else {
                  console.log('IP is valid');
                  ipResult = ipIsValid;
                  ipIsValid = true; // ()

                  // checking wheter key is valid
                  key = data.apiKey;
                  if (key !== undefined) {
                    let splitIp = ipResult.split('http://');
                    console.log(
                      'http://' + splitIp[splitIp.length - 1] + '/api/' + key
                    );
                    await getData(
                      'http://' +
                        splitIp[splitIp.length - 1] +
                        '/api/' +
                        key +
                        '/lights',
                      settings.fetchTime
                    ) //
                      .then(async (data) => {
                        try {
                          // bruh fr?
                          console.log(data[0].error);

                          manualLoginOpen = false;
                          open();

                          console.log('apiKey is incorrect');
                        } catch (error) {
                          // the typical "error is a success" ^^ ...
                          console.log('successful login'); // ↓
                          // error should mean success ;) ... --> oh bruh I 'already' recognized / mentioned that back then ...
                          // clearing normal IP input
                          let input = document.getElementById('IPInput');
                          input.value = '';

                          // set locals and initiate main
                          localStorage.setItem('bridgeIP', ip);
                          localStorage.setItem('apiKey', key);
                          bridgeIP = localStorage.getItem('bridgeIP');
                          apiKey = localStorage.getItem('apiKey');
                          mainPageInizialize();
                          welcomePage.style.display = 'none';
                        }
                      });
                  } else {
                    manualLoginOpen = false;
                    open();

                    console.log('apiKey is incorrect');
                  }
                }
              }
            }
          },
        });
      }
      const inputs = document.getElementsByClassName('IpInputVex'); // k-press is still recognized in input -->  finding inputs and then set their value to nothing
      for (let item of inputs) {
        console.log(item);
        item.addEventListener('input', resetInput);
        function resetInput() {
          // wait until k-input is registered, then set null
          item.value = null;
          item.removeEventListener('input', resetInput);
        }
      }
    }
    /*
    if (!manualLoginOpen) {
      manualLoginOpen = true;
      // open prompt
      vex.dialog.prompt({
        message: 'manual login',
        placeholder: 'bridge IP',
        callback: async function (ip) {
          //let ip = prompt("manual key and ip login - type bridge IP"); // prompt not working in electron! (state from before knowing that without vex)
          let ipIsValid;
          if (ip !== undefined) {
            ipIsValid = await checkIP(ip);
            if (ipIsValid === "notWorking") {
              ipIsValid = false;
              manualLoginOpen = false;
            } else {
              ipResult = ipIsValid;
              ipIsValid = true;
              let input = document.getElementById("IPInput");
              input.value = "";



              vex.dialog.prompt({
                message: 'manual login',
                placeholder: 'bridge api-key',
                callback: async function (key) {
                  if (key !== undefined) {
                    let splitIp=ipResult.split("http://");
                    console.log("http://" + splitIp[splitIp.length-1] + "/api/" + key)
                    await getData("http://" + splitIp[splitIp.length-1] + "/api/"+key+"/lights", settings.fetchTime) //
                      .then(async (data) => {
                        try {
                          console.log(data[0].error);
                        } catch(error) {
                          console.log("successfull login")
                          // error should mean success ;) ...
                        }
                      });
                  }
                  manualLoginOpen = false;
                }
              });
            }
          } else {
            manualLoginOpen = false;
          }

        }
      })


      //
    }*/
  }
  // do something
});
