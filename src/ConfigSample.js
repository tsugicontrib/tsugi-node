        
// Lets encrypt some things
const crypto = require('crypto');
const GLOBAL_LONG_CONFIG_KEY = crypto.randomBytes(256).toString('hex');

function encrypt(v) {
    if ( v === false ) return false;
    if ( v === null ) return null;
    let cipher = crypto.createCipher('aes192', GLOBAL_LONG_CONFIG_KEY);
    let encrypted = cipher.update(v, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(v) {
    if ( v === false ) return false;
    if ( v === null ) return null;
    let decipher = crypto.createDecipher('aes192', GLOBAL_LONG_CONFIG_KEY);
    var decrypted = decipher.update(v, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function sha256(v) {
    if ( v === false ) return false;
    if ( v === null ) return null;
    let hash = crypto.createHash('sha256');
    var hashed = hash.update(v, 'hex', 'utf8');
    hashed += hash.final('utf-8');
    return hashed;
}

/**
 * This is a sample of the configuration file.  Copy this to 
 * Config.js, change the class name at the beginning and the
 * last line, and edit all the values to set your configuration.
 */
class ConfigSample {

    constructor() {

        /**
         * This is the URL where the software is hosted
         * Do not add a trailing slash to this string
         */
        this.wwwroot = 'http://localhost/tsugi';  /// For normal
        // this.wwwroot = 'http://localhost:8888/tsugi';   // For MAMP
        
        /*
         * Database connection information to configure the PDO connection
         * You need to point this at a database with am account and password
         * that can create tables.   To make the initial tables go into Admin
         * console to run the upgrade.php script which auto-creates the tables.
         */
        this.pdo       = 'mysql:host=127.0.0.1;dbname=tsugi';
        // this.pdo       = 'mysql:host=127.0.0.1;port=8889;dbname=tsugi'; // MAMP
        /**
         * The database user (encrypted)
         * @type {string}
         */
        this._dbuser    = encrypt('ltiuser');
        /**
         * The database password (encrypted)
         * @type {string}
         */
        this._dbpass    = encrypt('ltipassword');
        
        /**
         * You can use the CDN copy of the static content in testing or 
         * light production.
         * If you check out a copy of the static content locally and do not
         * want to use the CDN copy (perhaps you are on a plane or are otherwise
         * not connected) change this configuration as show.
         */
         this.staticroot = 'https://www.dr-chuck.net/tsugi-static';
         // this.staticroot = this.wwwroot . "/../tsugi-static";
        
        /**
         * The dbprefix allows you to give all the tables a prefix
         * in case your hosting only gives you one database.  This
         * can be short like "t_" and can even be an empty string if you
         * can make a separate database for each instance of TSUGI.
         * This allows you to host multiple instances of TSUGI in a
         * single database if your hosting choices are limited.
         */
        this.dbprefix  = '';
        
        /**
         * This is the PW that you need to access the Administration
         * features of this application. (encrypted)
         * @type {string}
         */
        this.adminpw = 'short';

        /**
         * When this is true it enables a Developer test harness that can launch
         * tools using LTI.  It allows quick testing without setting up an LMS
         * course, etc.
         */
        this.DEVELOPER = true;
        
        /**
         * These values configure the cookie used to record the overall
         * login in a long-lived encrypted cookie.   Look at the library
         * code createSecureCookie() for more detail on how these operate.
         * @type {string}
         */
        this._cookiesecret = encrypt('warning:please-change-cookie-secret-a289b543');
        this.cookiename = 'TSUGIAUTO';
        this.cookiepad = '390b246ea9';
        
        /**
         * Where the bulk mail comes from - should be a real address with a wildcard box you check
         */
        this.maildomain = false; // 'mail.example.com';
        /**
         * The mail secret (encrypted)
         * @type {string}
         */
        this._mailsecret = encrypt('warning:please-change-mailsecret-92ds29');
        /**
         * Mail end of line - Depends on your mailer - may need to be \r\n
         */
        this.maileol = "\n";  // Depends on your mailer 
        
        /**
         * Set the nonce clearing check proability
         */
        this.noncecheck = 100;
        /**
         * Set the nonce expiry time
         */
        this.noncetime = 1800;
        
        /**
         * This is used to make sure that our constructed session ids
         * based on resource_link_id, oauth_consumer_key, etc are not
         * predictable or guessable.   Just make this a long random string.
         * See LTIX::getCompositeKey() for detail on how this operates.
         */
        this.sessionsalt = "warning:please-change-sessionsalt-89b543";
        
        // Timezone
        this.timezone = 'Pacific/Honolulu'; // Nice for due dates
        
        // Universal Analytics
        this.universal_analytics = false; // "UA-57880800-1";
        
        // Only define this if you are using Tsugi in single standalone app that 
        // will never be in iframes - because most browsers will *not* set cookies in
        // cross-domain iframes.   If you use this, you cannot be a different
        // user in a different tab or be in a different course in a different
        // tab.  
        // if ( !defined('COOKIE_SESSION') ) define('COOKIE_SESSION', true);
        
        /**
         * Effectively an "airplane mode" for the appliction.
         * Setting this to true makes it so that when you are completely 
         * disconnected, various tools will not access network resources 
         * like Google's map library and hang.  Also the Google login will 
         * be faked.  Don't run this in production.
         */
        this.OFFLINE = false;
    }

    /**
     * The database user (encrypted)
     * @type {string}
     */
    get dbuser() { return decrypt(this._dbuser); }

    /**
     * The database password (encrypted)
     * @type {string}
     */
    get dbpass() { return decrypt(this._dbpass); }

    /**
     * This is the PW that you need to access the Administration
     * features of this application. (encrypted)
     * @type {string}
     */
    get adminpw() { return decrypt(this._adminpw); }

    /**
     * These values configure the cookie used to record the overall
     * login in a long-lived encrypted cookie.   Look at the library
     * code createSecureCookie() for more detail on how these operate.
     * @type {string}
     */
    get cookiesecret() { return decrypt(this._cookiesecret); }

    /**
     * The mail secret (encrypted)
     * @type {string}
     */
    get mailsecret() { return decrypt(this._mailsecret); }
}
    
module.exports = ConfigSample;
