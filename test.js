const systemd = require('./src/index.js');

const Systemd = new systemd("cups")
const Restart = Systemd.restart();
const Status = Systemd.status();

console.log("Restart:", Restart)
console.log("Status:", Status)
