
let Settings = require ('./Settings'),
    Service = require ('./Service'),
    Result = require ('./Result'),
    Context = require ('./Context'),
    Link = require ('./Link'),
    Key = require ('./Key'),
    User = require ('./User'),
    TsugiUtils = require ('../util/TsugiUtils'),
    util = require ('util')

/**
 * This captures all of the data associated with the LTI Launch.
 */

class Launch {

    /**
     * @param {Config} Configuration settings
     */
    constructor(CFG, req, res, sess) {
        /**
         * The current conficuration
         * @type {Config}
         */
        this.CFG = CFG;
        this.req = req;
        this.res = res;
        this.sess = sess;
        this._complete = false;

    }

    /**
     * Fill the data structures from the row data
     */
    fill(row) {
      let service = null;

      if (TsugiUtils.isset(row)) {

        if (row.service_id) {
          service = new Service (row.service_id, row.service);
        }

        //Fill the result data

        let sgrade = TsugiUtils.toNull(row.grade);
        let grade = null;

        if (TsugiUtils.isset(sgrade)) {
            grade = parseFloat (sgrade);
        }

        this._result = new Result (
          row.result_id,
          grade,
          TsugiUtils.toNull (row.result_comment),
          TsugiUtils.toNull (row.result_url),
          TsugiUtils.toNull (row.sourcedid),
          service
        );

      //Creates the link object
      this._link = new Link (row.link_id, row.link_title, this._result, new Settings());

      //Creates the context object
      this._context = new Context (row.context_id, row.context_title, new Settings());

      //Creates the user object
      this._user = new User (
          row.user_id,
          TsugiUtils.toNull (row.user_email),
          TsugiUtils.toNull (row.user_displayname),
          parseInt (row.role,10)
      );

      //Creates the key object
      this._key = new Key (
        row.key_id,
        null
      );

      /*
        console.log (` The objects:
          ${util.inspect (this._user)}
          ${util.inspect (this._context)}
          ${util.inspect (this._link)}
          ${util.inspect (this._key)}
          `);
      */
      }
    }

    /**
     * Get the request associated with the launch.
     */
    get request() { return this.req; }

    /**
     * Get the response associated with the launch.
     */
    get response() { return this.res; }

    /**
     * Get the session associated with the launch.
     */
    get session() { return this.sess; }

    /**
     * Get the Context associated with the launch.
     *
     * @return {Context} the user
     */
    get context() { return this._context; }

    /**
     * Get the Link associated with the launch.
     */
    get link() { return this._link; }

    /**
     * Get the Result associated with the launch.
     */
    get result() { return this._result; }

    /**
     * Get the Service associated with the launch.
     */
    get service() { return this._service; }

    /**
     * Return the database connection used by Tsugi.
     */
    get connection() { return this; }

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
    // get base_string() { return 42; }

    /**
     * Get the error message if something went wrong with the setup
     */
    // get error_message() { return 42; }

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
    get complete() { return this._complete; }
    set complete(complete) { this._complete = complete; }

    /**
     * Indicate if this request is valid
     *
     * This fails if the LTI Launch was malformed or the session data
     * is corrupted.
     */
    // get valid() { return 42; }

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
