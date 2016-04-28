
var CFG = require('./Config'); 
var Tsugi = require('./src/Tsugi');

console.log(CFG.dbpass);
console.log(Tsugi);
// launch = Tsugi.requireData(CFG, Tsugi.ALL);
launch = Tsugi.requireData(CFG);
console.log(launch);
console.log(launch.user.id);

