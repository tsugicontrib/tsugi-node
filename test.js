
var Config = require('./Config'); 
var Tsugi = require('./src/Tsugi');

var CFG = new Config();
var tsugi = new Tsugi();

console.log("dbpass");
console.log(CFG.dbpass);
console.log(Tsugi);
console.log(tsugi);
// launch = tsugi.requireData(CFG, tsugi.ALL);
launch = tsugi.requireData(CFG);
console.log(launch);
console.log(launch.user.id);

