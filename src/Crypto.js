        
// Lets encrypt some things
var CryptoJS = require("crypto-js");
// This is not super-secure - just enough to keep plaintext
// passwords from showing up in the console.log() output
// Feel free to improve on this or set it to a long constant.
const GLOBAL_LONG_CONFIG_KEY = (new Date().toString())+(new Date().getTime())+(Math.random().toString());

/**
 * This is a simple set of static function encryption routines.
 */
class Crypto {

    /**
     * This does a simple AES encryption to avoid spilling secrets in logs.
     * The key is effectively random for a node execution so don't use this 
     * to store data in a database.
     * @type {string}
     */
    function encryptShortTerm(v) {
        if ( v === false ) return false;
        if ( v === null ) return null;
        let encrypted = CryptoJS.AES.encrypt(v.toString(),GLOBAL_LONG_CONFIG_KEY);
        return encrypted.toString();
    }

    /**
     * This does a simple AES descryption to avoid spilling secrets in logs.
     * The key is effectively random for a node execution so don't use this 
     * to store data in a database.
     * @type {string}
     */
    function decryptShortTerm(v) {
        if ( v === false ) return false;
        if ( v === null ) return null;
        let decrypted = CryptoJS.AES.decrypt(v,GLOBAL_LONG_CONFIG_KEY);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

}

module.exports = Crypto;
