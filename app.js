
var Config = require('./Config'); 
var CFG = new Config();
var Tsugi = require('./src/Tsugi');
tsugi = new Tsugi();

console.log(CFG.dbpass);
console.log(Tsugi);
console.log(tsugi);
launch = tsugi.requireData(CFG);
console.log(launch);
console.log(launch.user.id);

