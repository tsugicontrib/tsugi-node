        
class Config {
        
    constructor() {
        // This is the URL where the software is hosted
        // Do not add a trailing slash to this string
        this.wwwroot = 'http://localhost/tsugi';  /// For normal
        this.wwwroot = 'http://localhost:8888/tsugi';   // For MAMP
        
        // Database connection information to configure the PDO connection
        // You need to point this at a database with am account and password
        // that can create tables.   To make the initial tables go into Admin
        // to run the upgrade.php script which auto-creates the tables.
        this.pdo       = 'mysql:host=127.0.0.1;dbname=tsugi';
        this.pdo       = 'mysql:host=127.0.0.1;port=8889;dbname=tsugi'; // MAMP
        this.dbuser    = 'ltiuser';
        this.dbpass    = 'ltipassword';
        
        // You can use my CDN copy of the static content in testing or 
        // light production if you like:
        // this.staticroot = 'https://www.dr-chuck.net/tsugi-static';
        
        // If you check out a copy of the static content locally and do not
        // want to use the CDN copy (perhaps you are on a plane or are otherwise
        // not connected) use this configuration option instead of the above:
        // this.staticroot = this.wwwroot . "/../tsugi-static";
        
        // The dbprefix allows you to give all the tables a prefix
        // in case your hosting only gives you one database.  This
        // can be short like "t_" and can even be an empty string if you
        // can make a separate database for each instance of TSUGI.
        // This allows you to host multiple instances of TSUGI in a
        // single database if your hosting choices are limited.
        this.dbprefix  = '';
        
        // This is the PW that you need to access the Administration
        // features of this application.
        this.adminpw = 'short';
        
        // Set to true to redirect to the upgrading.php script
        // Also copy upgrading-dist.php to upgrading.php and add your message
        this.upgrading = false;
        
        // This is how the system will refer to itself.
        this.servicename = 'TSUGI';
        this.servicedesc = false;
        
        // Information on the owner of this system
        this.ownername = false;  // 'Charles Severance'
        this.owneremail = false; // 'csev@example.com'
        this.providekeys = false;  // true
        
        // Set these to your API key for your Google Sign on
        // https://console.developers.google.com/
        this.google_client_id = false; // '96041-nljpjj8jlv4.apps.googleusercontent.com';
        this.google_client_secret = false; // '6Q7w_x4ESrl29a';
        
        // From LTI 2.0 spec: A globally unique identifier for the service provider. 
        // As a best practice, this value should match an Internet domain name 
        // assigned by ICANN, but any globally unique identifier is acceptable.
        this.product_instance_guid = 'lti2.example.com';
        
        // From the CASA spec: originator_id a UUID picked by a publisher 
        // and used for all apps it publishes
        // this.casa_originator_id = md5(this.product_instance_guid);
        
        // When this is true it enables a Developer test harness that can launch
        // tools using LTI.  It allows quick testing without setting up an LMS
        // course, etc.
        this.DEVELOPER = true;
        
        // These values configure the cookie used to record the overall
        // login in a long-lived encrypted cookie.   Look at the library
        // code createSecureCookie() for more detail on how these operate.
        this.cookiesecret = 'warning:please-change-cookie-secret-a289b543';
        this.cookiename = 'TSUGIAUTO';
        this.cookiepad = '390b246ea9';
        
        // Where the bulk mail comes from - should be a real address with a wildcard box you check
        this.maildomain = false; // 'mail.example.com';
        this.mailsecret = 'warning:please-change-mailsecret-92ds29';
        this.maileol = "\n";  // Depends on your mailer - may need to be \r\n
        
        // Set the nonce clearing factor and expiry time
        this.noncecheck = 100;
        this.noncetime = 1800;
        
        // This is used to make sure that our constructed session ids
        // based on resource_link_id, oauth_consumer_key, etc are not
        // predictable or guessable.   Just make this a long random string.
        // See LTIX::getCompositeKey() for detail on how this operates.
        this.sessionsalt = "warning:please-change-sessionsalt-89b543";
        
        // Timezone
        this.timezone = 'Pacific/Honolulu'; // Nice for due dates
        
        // Old analytics
        this.analytics_key = false;  // "UA-423997-16";
        this.analytics_name = false; // "dr-chuck.com";
        
        // Universal Analytics
        this.universal_analytics = false; // "UA-57880800-1";
        
        // Only define this if you are using Tsugi in single standalone app that 
        // will never be in iframes - because most browsers will *not* set cookies in
        // cross-domain iframes.   If you use this, you cannot be a different
        // user in a different tab or be in a different course in a different
        // tab.  
        // if ( !defined('COOKIE_SESSION') ) define('COOKIE_SESSION', true);
        
        // Effectively an "airplane mode" for the appliction.
        // Setting this to true makes it so that when you are completely 
        // disconnected, various tools will not access network resources 
        // like Google's map library and hang.  Also the Google login will 
        // be faked.  Don't run this in production.
        
        this.OFFLINE = false;
        
    }
}
    
module.exports = new Config();
