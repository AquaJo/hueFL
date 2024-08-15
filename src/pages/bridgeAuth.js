function initializeBridgeAuth() {
  hueAuthPage.style.display = 'block';
  bridgeIP = localStorage.getItem('bridgeIP');
  auth_timer(); // for the GUI
  auth_intervalBumps(); // doing the post request to the bridge, checking status
}

let auth_timer_true = false;
async function auth_timer() {
  let timer = document.getElementById('p_authTimer_bridgeAuth');
  counter = 0;
  auth_timer_true = true;
  timerPlus1();
  function timerPlus1() {
    timer.innerHTML = counter;
    setTimeout(function () {
      counter++;
      if (counter <= 30) {
        if (auth_timer_true) {
          timerPlus1();
        }
      } else {
        if (auth_timer_true) {
          //
          auth_timer_true = false;
          auth_finished();
        }
      }
    }, 1000);
  }
}

async function auth_intervalBumps() {
  //postData(url = '', data = {}, timeout)
  bump();
  async function bump() {
    await postData(
      'http://' + bridgeIP + '/api',
      { devicetype: 'hueFL' },
      settings.fetchTime
    ) //
      .then(async (data) => {
        //console.log(data[0]);
        try {
          // might be a bit suboptimal  -->  multiple expected catching events (!)
          let key = data[0].success.username;

          // if the code comes till here, successful authentification :)
          //alert("success");
          localStorage.setItem('apiKey', key);
          apiKey = key;
          auth_finished();
        } catch (err) {
          //alert("fail");
          setTimeout(function () {
            if (auth_timer_true) {
              bump();
            } else {
              //alert("finished");
            }
          }, 800);
        }
      });
  }
}

function auth_finished() {
  hueAuthPage.style.display = 'none';
  if (auth_timer_true) {
    // indicates success
    auth_timer_true = false; // so its set to standart + gui - timer doesn't fire
    mainTitle.style.display = 'none';
    mainPageInizialize();
  } else {
    // indices fail
    hueAuthResPage.style.display = 'block';
  }
}

// here comes some code for authentification failure - page
document
  .getElementById('btn_back_hueAuthFail')
  .addEventListener('click', btn_back_hueAuthFail);
document
  .getElementById('btn_tryAgain_hueAuthFail')
  .addEventListener('click', btn_tryAgain_hueAuthFail);
function btn_back_hueAuthFail() {
  // back function ?? --> back(hide Elm,show Elm)
  hueAuthResPage.style.display = 'none';
  welcomePage.style.display = 'block';
}

function btn_tryAgain_hueAuthFail() {
  hueAuthResPage.style.display = 'none';
  initializeBridgeAuth();
}
