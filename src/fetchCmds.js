async function postData(url = '', data = {}, timeout) {
  timeout = 10000; // CHANGE IN THE FUTURE, ....
  return await api.send('fetch-post', [url, data, timeout]);
}

async function getData(url = '', timeout) {
  timeout = 10000; // CHANGE IN THE FUTURE BACK ...
  if (settings.devModeNoPort) {
    let response;
    if (url.includes('lights/')) {
      let key = url.charAt(url.lastIndexOf('/') + 1);
      if (key === '3') {
        response = {
          state: {
            on: false,
            bri: 0,
            alert: 'none',
            reachable: false,
          },
          type: 'Dimmable light',
          name: 'Example-Dimm-Light',
          modelid: 'Classic A60 W clear - LIGHTIFY',
          manufacturername: 'OSRAM',
          uniqueid: '1',
          swversion: 'V1.04.12',
        };
      } else if (key === '6') {
        response = {
          state: {
            on: true,
            bri: 254,
            alert: 'none',
            reachable: true,
          },
          type: 'Dimmable light',
          name: 'Another Dimm-Light',
          modelid: 'Classic A60 W clear - LIGHTIFY',
          manufacturername: 'OSRAM',
          uniqueid: '2',
          swversion: 'V1.04.12',
        };
      } else if (key === '7') {
        response = {
          state: {
            on: true,
            bri: 254,
            hue: 0,
            sat: 0,
            effect: 'none',
            xy: [0.3805, 0.3769],
            ct: 370,
            alert: 'none',
            colormode: 'ct',
            reachable: true,
          },
          type: 'Extended color light',
          name: 'Example-RGB-LightStrip',
          modelid: 'LIGHTIFY Indoor Flex RGBW',
          manufacturername: 'OSRAM',
          uniqueid: '3',
          swversion: 'V1.04.90',
        };
      } else {
        response = {
          state: {
            on: false,
            bri: 237,
            hue: 3072,
            sat: 247,
            effect: 'none',
            xy: [0.5537, 0.4111],
            ct: 500,
            alert: 'none',
            colormode: 'xy',
            reachable: false,
          },
          type: 'Extended color light',
          name: 'Another RGB-LightStrip',
          modelid: 'LIGHTIFY Indoor Flex RGBW',
          manufacturername: 'OSRAM',
          uniqueid: '4',
          swversion: 'V1.04.90',
        };
      }
    } else {
      response = {
        3: {
          state: {
            on: false,
            bri: 0,
            alert: 'none',
            reachable: false,
          },
          type: 'Dimmable light',
          name: 'Example-Dimm-Light',
          modelid: 'Classic A60 W clear - LIGHTIFY',
          manufacturername: 'OSRAM',
          uniqueid: '1',
          swversion: 'V1.04.12',
        },
        6: {
          state: {
            on: true,
            bri: 254,
            alert: 'none',
            reachable: true,
          },
          type: 'Dimmable light',
          name: 'Another Dimm-Light',
          modelid: 'Classic A60 W clear - LIGHTIFY',
          manufacturername: 'OSRAM',
          uniqueid: '2',
          swversion: 'V1.04.12',
        },
        7: {
          state: {
            on: true,
            bri: 254,
            hue: 0,
            sat: 0,
            effect: 'none',
            xy: [0.3805, 0.3769],
            ct: 370,
            alert: 'none',
            colormode: 'ct',
            reachable: true,
          },
          type: 'Extended color light',
          name: 'Example-RGB-LightStrip',
          modelid: 'LIGHTIFY Indoor Flex RGBW',
          manufacturername: 'OSRAM',
          uniqueid: '3',
          swversion: 'V1.04.90',
        },
        8: {
          state: {
            on: false,
            bri: 237,
            hue: 3072,
            sat: 247,
            effect: 'none',
            xy: [0.5537, 0.4111],
            ct: 500,
            alert: 'none',
            colormode: 'xy',
            reachable: false,
          },
          type: 'Extended color light',
          name: 'Another RGB-LightStrip',
          modelid: 'LIGHTIFY Indoor Flex RGBW',
          manufacturername: 'OSRAM',
          uniqueid: '4',
          swversion: 'V1.04.90',
        },
      };
    }
    return response;
  } else {
    let res = await api.send('fetch-get', [url, timeout]);
    return res;
  }
}

async function putData(url = '', data = {}, timeout) {
  let res = await api.send('fetch-put', [url, data, timeout]);
  return res;
}
