
/**
 * This captures all of the data associated with the LTI Launch.
 */

class Launch {

    /**
     * @param {Config} Configuration settings
     */
    constructor(CFG) {
        /**
         * The current conficuration
         * @type {Config}
         */
        this.CFG = CFG;

        let User = require("./User.js");

        /**
         * The current user 
         * @type {User}
         */
        this.user = new User(42);

        let Connection = require("./Connection.js");

        /**
         * The current connection 
         * @type {User}
         */
        this.db = new Connection(CFG);
    }

    /**
     * Get the request associated with the launch.
     */
    get request() { return 42; }

    /**
     * Get the response associated with the launch.
     */
    get response() { return 42; }

    /**
     * Get the session associated with the launch.
     */
    get session() { return 42; }

    /**
     * Get the Context associated with the launch.
     *
     * @return {Context} the user
     */
    get context() { return null; }

    /**
     * Get the Link associated with the launch.
     */
    get link() { return 42; }

    /**
     * Get the Result associated with the launch.
     */
    get result() { return 42; }

    /**
     * Get the Service associated with the launch.
     */
    get service() { return 42; }

    /**
     * Return the database connection used by Tsugi.
     */
    get connection() { return 42; }

    /**
     * Return the database prefix used by Tsugi.
     */
    get prefix() { return 42; }

    /**
     * Return the database helper class used by Tsugi.
     */
    get output() { return 42; }

    /**
     * Get the base string from the launch.
     *
     * @return This is null if it is not the original launch.
     * it is not restored when the launch is restored from 
     * the session.
     */
    get base_string() { return 42; }

    /**
     * Get the error message if something went wrong with the setup
     */
    get error_message() { return 42; }

    /**
     * Indicate if this request is completely handled
     *
     * This is used as follows:
     *
     *<pre><code>
     *      get void doPost (...)
     *      Launch launch = tsugi.getLaunch(req, res);
     *      if ( launch.isComplete() ) return;
     *</code></pre>
     *
     * This allows the Tsugi framework to do things like redirect back
     * to itself.
     */
    get complete() { return 42; }

    /**
     * Indicate if this request is valid
     *
     * This fails if the LTI Launch was malformed or the session data
     * is corrupted.
     */
    get valid() { return 42; }

    /** 
     * Get a GET URL to the current servlet
     *
     * We abstract this in case the framework needs to 
     * point to a URL other than the URL in the request
     * object.  This URL should be used for AJAX calls
     * to dynamic data in JavaScript.
     *
     * @param {string} path
     */
    getGetUrl(path) { return 42; }

    /** 
     * Get a POST URL to the current servlet
     *
     * We abstract this in case the framework needs to 
     * point to a URL other than the URL in the request
     * object.
     *
     * @param {string} path
     **/
    getPostUrl(path) { return 42; }

    /** 
     * Redirect to a path - can be null
     *
     * @param {string} path
     **/
    postRedirect(path) { return 42; }

    /** 
     * Get any needed hidden form fields
     *
     * This will be properly formatted HTML - most likely one
     * or more input type="hidden" fields - the framework
     * may use this to help it maintain context across
     * request / response cycles.
     *
     * @return {string} Text to include in a form.  May be the 
     * empty string if nothing is needed by the framework.
     **/
    get getHidden() { return 42; }

    /** 
     * Get a URL to the 'static' folder within this servlet
     *
     * We abstract this because this might be stored in a
     * CDN for this application. 
     * TODO: Define the property for this
     **/
    get getStaticUrl() { return 42; }

    /** 
     * Get a URL to a system-wide spinner image
     **/
    get getSpinnerUrl() { return 42; }

}

module.exports = Launch;
