<img align= "left" src="build/darkMode.svg" width="105">
<br>
<p style = "font-size:60px"">ueFL</p>

hueFL allows you to control Zigbee lamps and other devices controlled over a hue-bridge. All this comes shipped with a quite intuitive, minimal, sleek design & optional settings.\
Requires Java for some huge features like desktop background color- & dimm- syncing.\
It's a project from over a year ago that I've decided to revisit now, with the goal of refining it into a **more** publishable and stable state.\
Its not exactly there where I wanted it, but at the moment I have some other projects running ^^\
Use this software on your own "risk".

# Install

Check out the [releases](https://github.com/AquaJo/hueFL/releases) and feel free to install the latest version.\
Else you can build it yourself, [here](#build).\
If you already know your api-key and bridge-IP feel free to press `k` for manual login.

# Build

I used [Electron-Builder & Electron-Updater](https://www.electron.build/) for building.\
Therefore the `npm run dist` is the main way of building the application.

If you want to compile the [java-code](src/jars/Hue-Ambiance) feel free to use e.g. BlueJ.

# Dev

Dev experience isn't the nicest as of now. You need bundle setting's js-files before `electron .` when working in settings.\
Also `Ctrl+C` might not stop the java process. Feel free to manually close the application like its end-user intended.

# Credits

_Amazingly big Thanks to_

- **according styling:**
  - [Ahmad Emran](https://codepen.io/ahmadbassamemran) - [day & toggle-switch](https://codepen.io/ahmadbassamemran/pen/yLBXBmy)
  - [Vincent Garreau](https://github.com/VincentGarreau) - [Particle.js](https://github.com/VincentGarreau/particles.js)
  - [Aaron Iker](https://codepen.io/aaroniker) - [color-picker (including js & css & html)](https://codepen.io/aaroniker/pen/NLjmdz)
  - [Andreas Storm](https://codepen.io/avstorm) - [toggle-switch (used in settings)](https://codepen.io/avstorm/pen/jOEpBLW)
  - [yourpalnurav](https://codepen.io/yourpalnurav) - [animated button (used in settings)](https://codepen.io/yourpalnurav/pen/LqNmzL)
  - **...**
  ***
  - [Hubspot's](https://github.com/hubspot) [Vex](https://github.com/hubspot/vex) for their nice alerts
  - [Bootstrap](https://github.com/twbs/bootstrap) for nice content - building
  - [Google](https://www.google.com/) for their nice [Material-Icons](https://fonts.google.com/icons) and [Fonts](https://fonts.google.com/) :]
  - **...**
- **according libs:**

  - [Brian Grinstead](https://github.com/bgrins) - [tinyColor-tool](https://github.com/bgrins/TinyColor)
  - **...**

# Todo

- Improve dev-experience
- Set asar to true again and fix regarding problem (zip-version?)
- Github actions with minimal install only
- Fix - abrupt closing program causes java still running
- URL-Pipe-Rewriting
