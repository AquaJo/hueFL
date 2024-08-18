const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const path = require('path');
const { inherits } = require('util');
const electronPath = path.resolve('node_modules', '.bin', 'electron');
// Startet den Electron-Prozess im "detached" Modus
let npmCmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
const electronProcess = spawn(npmCmd, ['run', 'normalStart'], {
  detached: false,
  stdio: 'inherit',
});

let alreadyFinishing = false;
// kill electron process with java subprocess, detecting Ctrl+C in terminal here ^^
electronProcess.on('exit', (code) => {
  closeDetected();
});
process.on('SIGINT', (code) => {
  closeDetected();
});

function closeDetected() {
  if (alreadyFinishing) return;
  alreadyFinishing = true;
  console.log(`Close detected, will close java processes`);

  treeKill(electronProcess.pid, 'SIGKILL', (err) => {
    if (err) {
      //console.error('Failed to kill process tree:', err); // should be already deleted when this is reached
    } else {
      console.log('Successfully killed all still running processes.');
      process.exit(0);
    }
  });
}
