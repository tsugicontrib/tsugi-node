
var CFG = require('./Config');
var Tsugi = require('./src/Tsugi');
tsugi = new Tsugi();

console.log(Tsugi);
console.log(tsugi);
launch = tsugi.requireData(CFG);
console.log(launch);
console.log(launch.user.id);

