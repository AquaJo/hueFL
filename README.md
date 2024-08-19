<img align="left" src="build/hueFL-md.png#gh-dark-mode-only" width="240">
<img align="left" src="build/hueFL-md-inv.png#gh-light-mode-only" width="240">
<br><br><br><br><br>

hueFL allows you to control Zigbee lamps and other devices managed through a Hue Bridge. It comes with a quite intuitive, minimalist, and sleek design, along with optional settings.\
Java is required for some major features, such as syncing desktop background color and brightness.\
This is a project from over a year ago that I've decided to revisit, with the goal of refining it into a **more** polished and stable state.\
It's not exactly where I wanted it to be, but at the moment, I have some other projects running ^^\
Use this software at your own risk.

# Installation

Check out the [releases](https://github.com/AquaJo/hueFL/releases) and feel free to install the latest version.\
Alternatively, you can build it yourself, [here](#build).\
If you already know your API key and bridge IP, feel free to press `k` for manual login.

# Build

I used [Electron-Builder & Electron-Updater](https://www.electron.build/) for building.\
Therefore, `npm run dist` is the main way to build the application.

If you want to compile the [Java code](src/jars/Hue-Ambiance), feel free to use tools like BlueJ.

# Development

The development experience isn't the smoothest at the moment.

- Set `git config core.hooksPath .githooks` before creating commits.
- You need to bundle the setting's JS files before running `electron .` when working with settings.
  - This can be automated by e.g. running `npm start`
- Also, `Ctrl+C` might not stop the Java process.
  - Feel free to manually close the application as an end-user would.

# Credits

_Amazing thanks to_

- **For styling:**
  - [Ahmad Emran](https://codepen.io/ahmadbassamemran) - [Day & toggle-switch](https://codepen.io/ahmadbassamemran/pen/yLBXBmy)
  - [Vincent Garreau](https://github.com/VincentGarreau) - [Particle.js](https://github.com/VincentGarreau/particles.js)
  - [Aaron Iker](https://codepen.io/aaroniker) - [Color picker (including JS, CSS, and HTML)](https://codepen.io/aaroniker/pen/NLjmdz)
  - [Andreas Storm](https://codepen.io/avstorm) - [Toggle-switch (used in settings)](https://codepen.io/avstorm/pen/jOEpBLW)
  - [yourpalnurav](https://codepen.io/yourpalnurav) - [Animated button (used in settings)](https://codepen.io/yourpalnurav/pen/LqNmzL)
  - **...**
  ***
  - [HubSpot](https://github.com/hubspot) - [Vex](https://github.com/hubspot/vex) for their nice alerts
  - [Bootstrap](https://github.com/twbs/bootstrap) for nice content-building
  - [Google](https://www.google.com/) for their excellent [Material Icons](https://fonts.google.com/icons) and [Fonts](https://fonts.google.com/) :]
  - **...**
- **For libraries:**
  - [Brian Grinstead](https://github.com/bgrins) - [TinyColor tool](https://github.com/bgrins/TinyColor)
  - **...**

# Todo

- Improve development experience
- Set `asar` to true again and address related issues (zip version?)
- GitHub Actions with minimal install only
- Fix abrupt program closing causing Java to remain running
- URL pipe rewriting
